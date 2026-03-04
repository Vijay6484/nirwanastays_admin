import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Star, Building2, User, Calendar, Trash2, Plus, Upload, X, Save, Loader } from 'lucide-react';

interface Rating {
  id: number;
  guestName: string;
  guestPhoto: string;
  rating: number;
  review: string;
  location: string;
  date: string;
}

interface NewRating {
  guestName: string;
  guestPhoto: string;
  rating: number;
  review: string;
  location: string;
}

// Axios instance with base configuration
const api = axios.create({
  baseURL: 'https://api.nirwanastays.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token if needed
api.interceptors.request.use(
  (config) => {
    // You can add authentication tokens here if required
    // const token = localStorage.getItem('authToken');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

const Ratings = () => {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newRating, setNewRating] = useState<NewRating>({
    guestName: '',
    guestPhoto: '',
    rating: 5,
    review: '',
    location: ''
  });

  // Fetch ratings from API
  const fetchRatings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/admin/ratings');
      // Transform API data to match our interface
      const transformedData: Rating[] = response.data.map((item: any) => ({
        id: item.id,
        guestName: item.guestName,
        guestPhoto: item.image,
        rating: item.rating,
        review: item.review,
        location: item.propertyName,
        date: item.date
      }));
      setRatings(transformedData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch ratings');
      console.error('Error fetching ratings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRatings();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this rating?')) {
      try {
        await api.delete(`/admin/ratings/${id}`);
        setRatings(ratings.filter(rating => rating.id !== id));
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete rating');
        console.error('Error deleting rating:', err);
      }
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Create form data for file upload
      const formData = new FormData();
      formData.append('image', file);

      // Upload image to server
      const response = await api.post('/admin/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setNewRating(prev => ({
        ...prev,
        guestPhoto: response.data.imageUrl
      }));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload photo');
      console.error('Error uploading photo:', err);
      
      // Fallback to mock URL if upload fails
      const mockPhotoUrl = URL.createObjectURL(file);
      setNewRating(prev => ({
        ...prev,
        guestPhoto: mockPhotoUrl
      }));
    } finally {
      setUploading(false);
    }
  };

  const handleAddRating = async () => {
    if (!newRating.guestName || !newRating.review || !newRating.location) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      // Prepare data for API in the required format
      const ratingData = {
        guestName: newRating.guestName,
        image: newRating.guestPhoto || 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg',
        rating: newRating.rating,
        review: newRating.review,
        propertyName: newRating.location,
        date: new Date().toISOString()
      };

      const response = await api.post('/admin/ratings', ratingData);
      
      // Add new rating to state
      const newRatingWithId: Rating = {
        id: response.data.id,
        guestName: response.data.guestName,
        guestPhoto: response.data.image,
        rating: response.data.rating,
        review: response.data.review,
        location: response.data.propertyName,
        date: response.data.date
      };

      setRatings([newRatingWithId, ...ratings]);
      setNewRating({
        guestName: '',
        guestPhoto: '',
        rating: 5,
        review: '',
        location: ''
      });
      setShowAddModal(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add rating');
      console.error('Error adding rating:', err);
    }
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const renderRatingStars = (rating: number, onRatingChange?: (rating: number) => void) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        className={`h-6 w-6 cursor-pointer transition-colors ${
          index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300 hover:text-yellow-200'
        }`}
        onClick={() => onRatingChange && onRatingChange(index + 1)}
      />
    ));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6 pb-16 md:pb-0">
      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{error}</span>
          <button
            onClick={() => setError(null)}
            className="absolute top-0 right-0 p-3"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Ratings & Reviews</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and monitor guest ratings and reviews ({ratings.length} reviews)
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-nature-600 hover:bg-nature-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nature-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Review
        </button>
      </div>

      {/* Ratings Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <Loader className="h-8 w-8 animate-spin text-nature-600 mx-auto" />
            <p className="mt-2 text-gray-500">Loading reviews...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Guest
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Review
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {ratings.map((rating) => (
                  <tr key={rating.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-12 w-12 flex-shrink-0">
                          <img
                            className="h-12 w-12 rounded-full object-cover"
                            src={rating.guestPhoto}
                            alt={rating.guestName}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg';
                            }}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {rating.guestName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex mr-2">
                          {renderStars(rating.rating)}
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {rating.rating}/5
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs">
                        <p className="line-clamp-3">{rating.review}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{rating.location}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {formatDate(rating.date)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDelete(rating.id)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                        title="Delete Review"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && ratings.length === 0 && (
          <div className="text-center py-12">
            <Star className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No ratings yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Ratings and reviews will appear here once guests start reviewing their stays.
            </p>
            <div className="mt-6">
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-nature-600 hover:bg-nature-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Review
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Review Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-nature-100 sm:mx-0 sm:h-10 sm:w-10">
                    <Star className="h-6 w-6 text-nature-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Add New Review
                    </h3>
                    <div className="mt-4 space-y-4">
                      {/* Guest Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Guest Name *
                        </label>
                        <input
                          type="text"
                          value={newRating.guestName}
                          onChange={(e) => setNewRating({ ...newRating, guestName: e.target.value })}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-nature-500 focus:border-nature-500 sm:text-sm"
                          placeholder="Enter guest name"
                        />
                      </div>

                      {/* Photo Upload */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Guest Photo
                        </label>
                        <div className="mt-1 flex items-center space-x-4">
                          <div className="h-16 w-16 rounded-full overflow-hidden bg-gray-100">
                            <img
                              src={newRating.guestPhoto || 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg'}
                              alt="Guest preview"
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handlePhotoUpload}
                              className="hidden"
                              id="photo-upload"
                            />
                            <label
                              htmlFor="photo-upload"
                              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nature-500 cursor-pointer"
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              {uploading ? 'Uploading...' : 'Upload Photo'}
                            </label>
                            {uploading && <Loader className="h-4 w-4 animate-spin text-nature-600 ml-2" />}
                          </div>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          Optional. If no photo is uploaded, a default photo will be used.
                        </p>
                      </div>

                      {/* Rating */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Rating *
                        </label>
                        <div className="mt-1 flex items-center space-x-1">
                          {renderRatingStars(newRating.rating, (rating) => 
                            setNewRating({ ...newRating, rating })
                          )}
                          <span className="ml-2 text-sm text-gray-600">
                            {newRating.rating}/5
                          </span>
                        </div>
                      </div>

                      {/* Location */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Location *
                        </label>
                        <input
                          type="text"
                          value={newRating.location}
                          onChange={(e) => setNewRating({ ...newRating, location: e.target.value })}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-nature-500 focus:border-nature-500 sm:text-sm"
                          placeholder="e.g., Mumbai, Maharashtra"
                        />
                      </div>

                      {/* Review */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Review *
                        </label>
                        <textarea
                          rows={4}
                          value={newRating.review}
                          onChange={(e) => setNewRating({ ...newRating, review: e.target.value })}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-nature-500 focus:border-nature-500 sm:text-sm"
                          placeholder="Write the guest's review..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleAddRating}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-nature-600 text-base font-medium text-white hover:bg-nature-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nature-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Add Review
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setNewRating({
                      guestName: '',
                      guestPhoto: '',
                      rating: 5,
                      review: '',
                      location: ''
                    });
                  }}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nature-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Ratings;