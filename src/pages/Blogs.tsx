import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Edit2, XCircle, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const API_BASE_URL = 'https://api.nirwanastays.com/admin/blogs';

interface Blog {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  read_time: string;
  category: string;
  tags: string[];
  image: string;
  status: 'published' | 'draft';
  created_at?: string;
  updated_at?: string;
}

const Blogs: React.FC = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'Travel Guide', name: 'Travel Guide' },
    { id: 'Camping', name: 'Camping' },
    { id: 'Nature', name: 'Nature' },
    { id: 'Events', name: 'Events' }
  ];

  // Fetch blogs from API
  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      
      const url = `${API_BASE_URL}?${params.toString()}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch blogs');
      }
      
      const data = await response.json();
      setBlogs(data.blogs || data || []);
    } catch (err: any) {
      console.error('Error fetching blogs:', err);
      setError(err.message || 'Failed to load blogs');
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'Failed to load blogs'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchBlogs();
    }, 500);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, selectedCategory]);

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        setDeleteLoading(id);
        const response = await fetch(`${API_BASE_URL}/${id}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          throw new Error('Failed to delete blog');
        }

        Swal.fire('Deleted!', 'Blog has been deleted.', 'success');
        fetchBlogs();
      } catch (err: any) {
        console.error('Error deleting blog:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.message || 'Failed to delete blog'
        });
      } finally {
        setDeleteLoading(null);
      }
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getImageUrl = (image: string) => {
    if (!image) return 'https://images.pexels.com/photos/2666598/pexels-photo-2666598.jpeg';
    if (image.startsWith('http')) return image;
    if (image.startsWith('/uploads')) return `https://api.nirwanastays.com${image}`;
    return image;
  };

  return (
    <div className="space-y-6 pb-16 md:pb-0">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog Posts</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your resort's blog content</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            to="/blogs/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-navy-600 hover:bg-navy-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Blog Post
          </Link>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search blogs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-navy-500 focus:border-navy-500 sm:text-sm"
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
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="block w-full sm:w-48 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-navy-500 focus:border-navy-500 sm:text-sm rounded-md"
        >
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-20">
          <Loader className="h-8 w-8 animate-spin text-navy-600" />
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Blog Grid */}
      {!loading && !error && (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {blogs.map(blog => (
            <div key={blog.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="relative h-48">
                <img
                  src={getImageUrl(blog.image)}
                  alt={blog.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/2666598/pexels-photo-2666598.jpeg';
                  }}
                />
                <div className="absolute top-2 right-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      blog.status === 'published'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {blog.status.charAt(0).toUpperCase() + blog.status.slice(1)}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-medium text-gray-900 line-clamp-2">
                  {blog.title}
                </h3>
                <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                  {blog.excerpt}
                </p>
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <span className="capitalize">{blog.category}</span>
                  <span className="mx-2">•</span>
                  <span>{formatDate(blog.date)}</span>
                </div>
                {blog.tags && blog.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {blog.tags.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="mt-4 flex space-x-2">
                  <Link
                    to={`/blogs/${blog.id}`}
                    className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy-500"
                  >
                    <Edit2 className="h-4 w-4 mr-1" />
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(blog.id)}
                    disabled={deleteLoading === blog.id}
                    className="inline-flex justify-center items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-red-600 bg-white hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                  >
                    {deleteLoading === blog.id ? (
                      <Loader className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && blogs.length === 0 && (
        <div className="text-center py-10">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No blogs found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || selectedCategory !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by creating your first blog post.'}
          </p>
          {!searchTerm && selectedCategory === 'all' && (
            <div className="mt-6">
              <Link
                to="/blogs/new"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-navy-600 hover:bg-navy-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Blog Post
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Blogs;