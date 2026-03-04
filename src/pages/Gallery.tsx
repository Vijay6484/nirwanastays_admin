import React, { useState, useEffect, useRef } from 'react';
import { Image, Search, Filter, UploadCloud, XCircle, Trash2, Edit, Eye, AlertCircle, CheckCircle } from 'lucide-react';

interface GalleryImage {
  id: string;
  image_url: string;
  title: string;
  alt_text: string;
  description: string;
  category: string;
  sort_order?: number;
  active?: number;
  created_at?: string;
  updated_at?: string;
}

interface GalleryApiResponse {
  images: GalleryImage[];
  total: number;
  limit: number;
  offset: number;
}

interface CategoryStat {
  category: string;
  count: number;
}

interface GalleryStats {
  total: number;
  by_category: CategoryStat[];
}

const Gallery = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [stats, setStats] = useState<GalleryStats>({ total: 0, by_category: [] });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadDetails, setUploadDetails] = useState({
    category: 'accommodation',
    title: '',
    alt_text: '',
    description: ''
  });
  const API_BASE_URL = 'https://api.nirwanastays.com'; // Commented out API URL
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  const filters = [
    { id: 'all', name: 'All' },
    { id: 'accommodation', name: 'Accommodation' },
    { id: 'activities', name: 'Activities' },
    { id: 'nature', name: 'Nature' },
    { id: 'lakeside', name: 'Lake Side' },
  ];

  // Fetch gallery images from backend
  const fetchImages = async () => {
    // Commented out API call - using mock data
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (activeFilter !== 'all') params.append('category', activeFilter);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`${API_BASE_URL}/admin/gallery?${params}`);
      if (!response.ok) throw new Error('Failed to fetch images');

      const data: GalleryApiResponse = await response.json();
      setImages(data.images || []);
    } catch (err: any) {
      setError('Failed to load gallery images');
      console.error('Error fetching images:', err);
    } finally {
      setLoading(false);
    }
    
    // Mock gallery data
    // setLoading(true);
    // setTimeout(() => {
    //   const mockImages: GalleryImage[] = [
    //     {
    //       id: '1',
    //       image_url: 'https://images.pexels.com/photos/1134176/pexels-photo-1134176.jpeg',
    //       title: 'Lake View Villa',
    //       alt_text: 'Beautiful lake view villa',
    //       description: 'Stunning villa with panoramic lake views',
    //       category: 'accommodation'
    //     },
    //     {
    //       id: '2',
    //       image_url: 'https://images.pexels.com/photos/2666598/pexels-photo-2666598.jpeg',
    //       title: 'Nature Trail',
    //       alt_text: 'Scenic nature trail',
    //       description: 'Beautiful hiking trail through the forest',
    //       category: 'nature'
    //     }
    //   ];
    //   setImages(mockImages);
    //   setLoading(false);
    // }, 1000);
  };

  // Fetch gallery statistics
  const fetchStats = async () => {
    // Commented out API call - using mock stats
    try {
      const response = await fetch(`${API_BASE_URL}/admin/gallery/stats`, {
        method: 'GET',
      });
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data: GalleryStats = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
    
    // Mock stats
    // setStats({
    //   total: 2,
    //   by_category: [
    //     { category: 'accommodation', count: 1 },
    //     { category: 'nature', count: 1 }
    //   ]
    // });
  };

  // Upload images to backend
  const handleUpload = async (files: FileList | null, details: typeof uploadDetails) => {
    if (!files || files.length === 0) return;

    // Commented out API upload - using mock upload
    try {
      setUploading(true);
      setError('');

      const uploadedImages: { src: string; alt: string }[] = [];

      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('image', file);

        const res = await fetch('https://plumeriaretreat.com/upload.php', {
          method: 'POST',
          body: formData,
        });
        const rawText = await res.text();
        let data: any;

        try {
          data = JSON.parse(rawText);
        } catch (err) {
          console.error('Non-JSON PHP response:', rawText);
          throw new Error(`Server error: ${rawText || res.statusText}`);
        }

        if (data.success && data.filename) {
          uploadedImages.push({
            src: data.url,
            alt: details.alt_text || file.name,
          });
        } else {
          throw new Error(data.message || 'Upload failed on server');
        }
      }

      const response = await fetch(`${API_BASE_URL}/admin/gallery/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          images: uploadedImages,
          category: details.category,
          title: details.title,
          alt_text: details.alt_text,
          description: details.description,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Image metadata save failed');
      }

      const savedData: { images: GalleryImage[] } = await response.json();
      setSuccess(`${savedData.images.length} image(s) uploaded successfully`);

      await fetchImages();
      await fetchStats();

      if (fileInputRef.current) fileInputRef.current.value = '';
      setUploadDetails({
        category: 'accommodation',
        title: '',
        alt_text: '',
        description: ''
      });

    } catch (err: any) {
      setError(err.message || 'Image upload failed');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
    
    // Mock upload
    // setUploading(true);
    // setTimeout(() => {
    //   setSuccess(`${files.length} image(s) uploaded successfully`);
    //   setUploading(false);
      
    //   // Reset form
    //   if (fileInputRef.current) fileInputRef.current.value = '';
    //   setUploadDetails({
    //     category: 'accommodation',
    //     title: '',
    //     alt_text: '',
    //     description: ''
    //   });
    // }, 2000);
  };

  // Handle modal upload
  const handleModalUpload = () => {
    if (!selectedFiles) return;
    handleUpload(selectedFiles, uploadDetails);
    setShowUploadModal(false);
    setSelectedFiles(null);
  };

  // Delete image from backend
  const handleDelete = async (imageId: string, imageUrl?: string) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;

    // Commented out API delete - using mock delete
    try {
      const response = await fetch(`${API_BASE_URL}/admin/gallery/${imageId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        let errorMsg = 'Delete failed';
        try {
          const errorData = await response.json();
          errorMsg = errorData.error || errorMsg;
        } catch {
          errorMsg = response.statusText || errorMsg;
        }
        throw new Error(errorMsg);
      }

      setSuccess('Image deleted successfully');
      setImages(prev => prev.filter(img => img.id !== imageId));
      await fetchStats();
    } catch (err: any) {
      setError(err.message || 'Failed to delete image');
      console.error('Delete error:', err);
    }
    
    // Mock delete
    // setSuccess('Image deleted successfully');
    // setImages(prev => prev.filter(img => img.id !== imageId));
  };

  // Clear messages after 3 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // Fetch data on component mount and filter/search changes
  useEffect(() => {
    fetchImages();
  }, [activeFilter, searchTerm]);

  useEffect(() => {
    fetchStats();
  }, []);

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFiles(files);
      // Set default category based on current filter
      setUploadDetails(prev => ({
        ...prev,
        category: activeFilter === 'all' ? 'accommodation' : activeFilter,
      }));
      setShowUploadModal(true);
    }
  };

  // Trigger file input click
  const triggerUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-6 pb-16 md:pb-0">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={() => {
                setShowUploadModal(false);
                setSelectedFiles(null);
              }}
            >
              <XCircle className="h-6 w-6" />
            </button>
            <h2 className="text-lg font-semibold mb-4">Upload Image Details</h2>

            {/* Show selected files */}
            {selectedFiles && (
              <div className="mb-4 p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-600">
                  Selected files: {Array.from(selectedFiles).map(f => f.name).join(', ')}
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Category *</label>
                <select
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={uploadDetails.category}
                  onChange={e => setUploadDetails({ ...uploadDetails, category: e.target.value })}
                  required
                >
                  {filters.filter(f => f.id !== 'all').map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Title *</label>
                <input
                  type="text"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={uploadDetails.title}
                  onChange={e => setUploadDetails({ ...uploadDetails, title: e.target.value })}
                  placeholder="Enter image title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Alt Text *</label>
                <input
                  type="text"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={uploadDetails.alt_text}
                  onChange={e => setUploadDetails({ ...uploadDetails, alt_text: e.target.value })}
                  placeholder="Enter alt text for accessibility"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={uploadDetails.description}
                  onChange={e => setUploadDetails({ ...uploadDetails, description: e.target.value })}
                  placeholder="Enter image description (optional)"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
                  onClick={() => {
                    setShowUploadModal(false);
                    setSelectedFiles(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={uploading}
                  onClick={handleModalUpload}
                >
                  {uploading ? 'Uploading...' : 'Upload Images'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gallery</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your resort's image gallery ({stats.total} images)
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            type="button"
            onClick={triggerUpload}
            disabled={uploading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <UploadCloud className="h-4 w-4 mr-2" />
            {uploading ? 'Uploading...' : 'Upload Images'}
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-50 p-4">
          <div className="flex">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">{success}</p>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search gallery..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <XCircle className="h-5 w-5 text-gray-400 hover:text-gray-500" />
            </button>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="sm:hidden">
        <select
          id="mobile-tabs"
          name="mobile-tabs"
          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          value={activeFilter}
          onChange={(e) => setActiveFilter(e.target.value)}
        >
          {filters.map((filter) => (
            <option key={filter.id} value={filter.id}>
              {filter.name}
              {stats.by_category.find(cat => cat.category === filter.id)?.count !== undefined &&
                ` (${stats.by_category.find(cat => cat.category === filter.id)?.count})`}
            </option>
          ))}
        </select>
      </div>
      <div className="hidden sm:block">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {filters.map((filter) => {
              const count =
                filter.id === 'all'
                  ? images.length
                  : images.filter(img => img.category === filter.id).length;

              return (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`${activeFilter === filter.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors duration-150`}
                >
                  {filter.name} ({count})
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading images...</span>
        </div>
      )}

      {/* Gallery Grid */}
      {!loading && (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
          {images.map((image) => (
            <div
              key={image.id}
              className="relative group rounded-lg overflow-hidden bg-gray-200"
              style={{ aspectRatio: '1/1' }} // Ensures square containers
            >
              {/* Image container with full coverage */}
              <div className="relative w-full h-full">
                <img
                  src={image.image_url}
                  alt={image.alt_text || image.title}
                  className="absolute inset-0 w-full h-full object-cover" // Changed from object-fit to object-cover
                  onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                    e.currentTarget.src = 'https://placehold.co/300x300?text=Not+Found';
                    e.currentTarget.className = 'absolute inset-0 w-full h-full object-cover bg-gray-100';
                  }}
                />

                {/* Hover overlay with buttons */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 flex space-x-2 transition-opacity duration-200">
                    <button
                      onClick={() => handleDelete(image.id, image.image_url)}
                      className="p-1.5 bg-white rounded-full text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete image"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => window.open(image.image_url, '_blank')}
                      className="p-1.5 bg-white rounded-full text-blue-600 hover:bg-blue-50 transition-colors"
                      title="View full image"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Image caption */}
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 via-black/60 to-transparent">
                <p className="text-white text-sm font-medium truncate" title={image.title}>
                  {image.title}
                </p>
                <span className="text-xs text-gray-300 capitalize">
                  {image.category}
                </span>
              </div>
            </div>
          ))}

          {/* Upload Placeholder */}
          <div
            onClick={triggerUpload}
            className="relative rounded-lg overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-colors"
          >
            <div className="aspect-w-1 aspect-h-1 flex flex-col items-center justify-center p-4">
              <UploadCloud className="h-8 w-8 text-gray-400" />
              <p className="text-sm text-gray-500 mt-2 text-center">
                {uploading ? 'Uploading...' : 'Upload Image'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* No images state */}
      {!loading && images.length === 0 && (
        <div className="text-center py-10">
          <Image className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No images found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || activeFilter !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'Upload your first image to get started.'
            }
          </p>
          {(!searchTerm && activeFilter === 'all') && (
            <button
              onClick={triggerUpload}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <UploadCloud className="h-4 w-4 mr-2" />
              Upload Images
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Gallery;