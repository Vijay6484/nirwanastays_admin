import React, { useState, useEffect } from 'react';
import { ArrowLeft, Coffee, Save, Loader, AlertCircle, Upload } from 'lucide-react';

const API_BASE_URL =  'https://api.nirwanastays.com/admin';

const ServiceForm = () => {
  // Get ID from URL params (simulate useParams)
  const [serviceId, setServiceId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploading, setUploading] = useState(false);

  const isEditing = serviceId !== null;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    price: '',
    duration: 60,
    available: true
  });

  type FormFields = 'name' | 'description' | 'image' | 'price' | 'duration' | 'available';
  const [errors, setErrors] = useState<Partial<Record<FormFields, string>>>({});

  // Simulate getting ID from URL (in real app, use useParams from react-router)
  useEffect(() => {
    const path = window.location.pathname;
    const matches = path.match(/\/services\/(\d+)/);
    if (matches) {
      setServiceId(parseInt(matches[1]));
    }
  }, []);

  // Fetch service data for editing
  useEffect(() => {
    if (isEditing && serviceId) {
      fetchService();
    }
  }, [serviceId]);

  const fetchService = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`${API_BASE_URL}/services/${serviceId}`);
      
      if (!response.ok) {
        throw new Error('Service not found');
      }
      
      const service = await response.json();
      setFormData({
        name: service.name,
        description: service.description,
        image: service.image,
        price: service.price.toString(),
        duration: service.duration,
        available: service.available
      });
    } catch (err) {
      setError(
        err && typeof err === 'object' && 'message' in err
          ? (err as { message: string }).message
          : 'Failed to fetch service'
      );
    } finally {
      setLoading(false);
    }
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' && e.target instanceof HTMLInputElement ? e.target.checked : value
    }));

    // Clear specific field error when user starts typing
    if (errors[name as FormFields]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  interface ImageUploadResponse {
    imageUrl: string;
  }

  interface ImageUploadEvent extends React.ChangeEvent<HTMLInputElement> {
    target: HTMLInputElement & EventTarget & { files: FileList };
  }

  const handleImageUpload = async (e: ImageUploadEvent): Promise<void> => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      setError('');

      const formDataUpload = new FormData();
      formDataUpload.append('image', file);

      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formDataUpload,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const { imageUrl }: ImageUploadResponse = await response.json();
      setFormData(prev => ({
        ...prev,
        image: imageUrl
      }));

      setSuccess('Image uploaded successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const validate = () => {
    const newErrors: Partial<Record<FormFields, string>> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Service name is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.image.trim()) {
      newErrors.image = 'Image URL is required';
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }
    if (!formData.duration || parseInt(formData.duration as any) <= 0) {
      newErrors.duration = 'Duration must be greater than 0';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  interface SubmitData {
    name: string;
    description: string;
    image: string;
    price: number;
    duration: number;
    available: boolean;
  }

  interface ErrorResponse {
    error?: string;
    [key: string]: any;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const submitData: SubmitData = {
        ...formData,
        price: parseFloat(formData.price),
        duration: parseInt(formData.duration as any)
      };

      const url = isEditing 
        ? `${API_BASE_URL}/services/${serviceId}`
        : `${API_BASE_URL}/services`;
      
      const method: 'PUT' | 'POST' = isEditing ? 'PUT' : 'POST';

      const response: Response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const errorData: ErrorResponse = await response.json();
        throw new Error(errorData.error || 'Failed to save service');
      }

      setSuccess(isEditing ? 'Service updated successfully!' : 'Service created successfully!');
      
      // Redirect to services list after a short delay
      setTimeout(() => {
        window.location.href = '/services';
      }, 1500);

    } catch (err: any) {
      setError(err.message || 'Failed to save service');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    window.history.back();
  };

  if (loading && isEditing && !formData.name) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading service...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16 md:pb-0">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center">
            <button
              onClick={handleBack}
              className="mr-2 text-gray-400 hover:text-gray-500"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Edit Service' : 'Add New Service'}
            </h1>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {isEditing
              ? 'Update service details'
              : 'Create a new service for your resort'}
          </p>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <Coffee className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">{success}</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6 space-y-6">
            <h2 className="text-lg font-medium text-gray-900 border-b pb-2">Service Information</h2>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Service Name *
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm rounded-md ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter service name"
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description *
                </label>
                <div className="mt-1">
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                    className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm rounded-md ${
                      errors.description ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Describe your service in detail"
                  />
                  {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                </div>
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="image" className="block text-sm font-medium text-gray-700">
                  Image URL *
                </label>
                <div className="mt-1 flex space-x-2">
                  <input
                    type="text"
                    name="image"
                    id="image"
                    value={formData.image}
                    onChange={handleChange}
                    className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm rounded-md ${
                      errors.image ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter image URL or upload below"
                  />
                </div>
                {errors.image && <p className="mt-1 text-sm text-red-600">{errors.image}</p>}
                
                <div className="mt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Or upload an image
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {uploading ? 'Uploading...' : 'Choose File'}
                    </label>
                    {uploading && <Loader className="h-4 w-4 animate-spin text-blue-600" />}
                  </div>
                </div>
              </div>

              {formData.image && (
                <div className="sm:col-span-6">
                  <label className="block text-sm font-medium text-gray-700">Image Preview</label>
                  <div className="mt-1 w-full h-48 rounded-md overflow-hidden bg-gray-100">
                    <img
                      src={formData.image}
                      alt="Service preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/640x360?text=Invalid+Image+URL';
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="sm:col-span-3">
                <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                  Price (₹) *
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="price"
                    id="price"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleChange}
                    className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm rounded-md ${
                      errors.price ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                  />
                  {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                  Duration (minutes) *
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="duration"
                    id="duration"
                    min="0"
                    value={formData.duration}
                    onChange={handleChange}
                    className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm rounded-md ${
                      errors.duration ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="60"
                  />
                  {errors.duration && <p className="mt-1 text-sm text-red-600">{errors.duration}</p>}
                </div>
              </div>

              <div className="sm:col-span-6">
                <div className="flex items-center">
                  <input
                    id="available"
                    name="available"
                    type="checkbox"
                    checked={formData.available}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="available" className="ml-2 block text-sm text-gray-700">
                    Available for booking
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleBack}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                {isEditing ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {isEditing ? 'Update Service' : 'Create Service'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ServiceForm;
// setError is already defined as a state setter from useState above, so this function is not needed and can be removed.
// If you need to use setError elsewhere, just use the setError from useState.
// No implementation needed here.
