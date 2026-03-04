import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Upload, Loader, AlertCircle, Image as ImageIcon, Plus, Trash2, XCircle, CheckCircle } from 'lucide-react';
import Swal from 'sweetalert2';

const API_BASE_URL = 'https://api.nirwanastays.com/admin/blogs';

interface ContentItem {
  type: 'paragraph' | 'heading' | 'list';
  text?: string;
  items?: string[];
}

interface BlogFormData {
  title: string;
  excerpt: string;
  author: string;
  date: string;
  category: string;
  tags: string[];
  image: string;
  content: ContentItem[];
  status: 'published' | 'draft';
}

const BlogForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tagInput, setTagInput] = useState('');

  const [formData, setFormData] = useState<BlogFormData>({
    title: '',
    excerpt: '',
    author: 'Nirwana Stays Team',
    date: new Date().toISOString().split('T')[0],
    category: 'Travel Guide',
    tags: [],
    image: '',
    content: [{ type: 'paragraph', text: '' }],
    status: 'draft'
  });

  const categories = [
    { id: 'Travel Guide', name: 'Travel Guide' },
    { id: 'Camping', name: 'Camping' },
    { id: 'Nature', name: 'Nature' },
    { id: 'Events', name: 'Events' }
  ];

  useEffect(() => {
    if (isEditing && id) {
      fetchBlog();
    }
  }, [id, isEditing]);

  const fetchBlog = async () => {
    try {
      setFetching(true);
      const response = await fetch(`${API_BASE_URL}/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch blog');
      }
      
      const blog = await response.json();
      
      setFormData({
        title: blog.title || '',
        excerpt: blog.excerpt || '',
        author: blog.author || 'Nirwana Stays Team',
        date: blog.date || new Date().toISOString().split('T')[0],
        category: blog.category || 'Travel Guide',
        tags: Array.isArray(blog.tags) ? blog.tags : [],
        image: blog.image || '',
        content: Array.isArray(blog.content) && blog.content.length > 0 
          ? blog.content 
          : [{ type: 'paragraph', text: '' }],
        status: blog.status || 'draft'
      });
    } catch (err: any) {
      console.error('Error fetching blog:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'Failed to load blog'
      });
      navigate('/blogs');
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      Swal.fire({
        icon: 'error',
        title: 'File too large',
        text: 'Image must be less than 10MB'
      });
      return;
    }

    try {
      const formDataToUpload = new FormData();
      formDataToUpload.append('image', file);
      
      // For now, create a preview. In production, upload to backend first
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          image: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Error uploading image:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to upload image'
      });
    }
  };

  const addContentItem = (type: 'paragraph' | 'heading' | 'list') => {
    setFormData(prev => ({
      ...prev,
      content: [
        ...prev.content,
        type === 'list' ? { type, items: [''] } : { type, text: '' }
      ]
    }));
  };

  const updateContentItem = (index: number, field: 'text' | 'items', value: string | string[]) => {
    setFormData(prev => {
      const newContent = [...prev.content];
      newContent[index] = {
        ...newContent[index],
        [field]: value
      };
      return {
        ...prev,
        content: newContent
      };
    });
  };

  const removeContentItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      content: prev.content.filter((_, i) => i !== index)
    }));
  };

  const addListItem = (contentIndex: number) => {
    setFormData(prev => {
      const newContent = [...prev.content];
      const listItem = newContent[contentIndex];
      if (listItem.type === 'list' && listItem.items) {
        newContent[contentIndex] = {
          ...listItem,
          items: [...listItem.items, '']
        };
      }
      return {
        ...prev,
        content: newContent
      };
    });
  };

  const updateListItem = (contentIndex: number, itemIndex: number, value: string) => {
    setFormData(prev => {
      const newContent = [...prev.content];
      const listItem = newContent[contentIndex];
      if (listItem.type === 'list' && listItem.items) {
        const newItems = [...listItem.items];
        newItems[itemIndex] = value;
        newContent[contentIndex] = {
          ...listItem,
          items: newItems
        };
      }
      return {
        ...prev,
        content: newContent
      };
    });
  };

  const removeListItem = (contentIndex: number, itemIndex: number) => {
    setFormData(prev => {
      const newContent = [...prev.content];
      const listItem = newContent[contentIndex];
      if (listItem.type === 'list' && listItem.items) {
        newContent[contentIndex] = {
          ...listItem,
          items: listItem.items.filter((_, i) => i !== itemIndex)
        };
      }
      return {
        ...prev,
        content: newContent
      };
    });
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validation
    if (!formData.title.trim()) {
      setError('Title is required');
      setLoading(false);
      return;
    }
    if (!formData.excerpt.trim()) {
      setError('Excerpt is required');
      setLoading(false);
      return;
    }
    if (formData.content.length === 0 || (formData.content.length === 1 && !formData.content[0].text && !formData.content[0].items)) {
      setError('Content is required');
      setLoading(false);
      return;
    }

    try {
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('excerpt', formData.excerpt);
      submitData.append('author', formData.author);
      submitData.append('date', formData.date);
      submitData.append('category', formData.category);
      submitData.append('tags', JSON.stringify(formData.tags));
      submitData.append('content', JSON.stringify(formData.content));
      submitData.append('status', formData.status);

      // Handle image
      if (formData.image) {
        if (formData.image.startsWith('data:')) {
          // Convert data URL to file if needed
          const response = await fetch(formData.image);
          const blob = await response.blob();
          const file = new File([blob], 'image.jpg', { type: blob.type });
          submitData.append('image', file);
        } else if (formData.image.startsWith('http') || formData.image.startsWith('/uploads')) {
          submitData.append('image', formData.image);
        }
      }

      const url = isEditing ? `${API_BASE_URL}/${id}` : API_BASE_URL;
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        body: submitData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save blog');
      }

      const result = await response.json();
      
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: isEditing ? 'Blog updated successfully!' : 'Blog created successfully!',
        timer: 1500,
        showConfirmButton: false
      });

      setTimeout(() => {
        navigate('/blogs');
      }, 1500);
    } catch (err: any) {
      console.error('Error saving blog:', err);
      setError(err.message || 'Failed to save blog post');
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'Failed to save blog post'
      });
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (image: string) => {
    if (!image) return '';
    if (image.startsWith('http')) return image;
    if (image.startsWith('/uploads')) return `https://api.nirwanastays.com${image}`;
    return image;
  };

  if (fetching) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader className="h-8 w-8 animate-spin text-navy-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16 md:pb-0">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center">
            <button
              onClick={() => navigate('/blogs')}
              className="mr-2 text-gray-400 hover:text-gray-500"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Edit Blog Post' : 'Create New Blog Post'}
            </h1>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {isEditing ? 'Update your blog post' : 'Share your thoughts and experiences'}
          </p>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <CheckCircle className="h-5 w-5 text-green-400" />
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
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6 space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
            
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-4">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Blog Title *
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="title"
                    id="title"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-navy-500 focus:border-navy-500 block w-full sm:text-sm border-gray-300 rounded-md px-3 py-2"
                    placeholder="Enter blog title"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Category *
                </label>
                <div className="mt-1">
                  <select
                    id="category"
                    name="category"
                    required
                    value={formData.category}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-navy-500 focus:border-navy-500 block w-full sm:text-sm border-gray-300 rounded-md px-3 py-2"
                  >
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700">
                  Excerpt *
                </label>
                <div className="mt-1">
                  <textarea
                    id="excerpt"
                    name="excerpt"
                    rows={3}
                    required
                    value={formData.excerpt}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-navy-500 focus:border-navy-500 block w-full sm:text-sm border-gray-300 rounded-md px-3 py-2"
                    placeholder="Brief description of the blog post"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="author" className="block text-sm font-medium text-gray-700">
                  Author *
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="author"
                    id="author"
                    required
                    value={formData.author}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-navy-500 focus:border-navy-500 block w-full sm:text-sm border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                  Date *
                </label>
                <div className="mt-1">
                  <input
                    type="date"
                    name="date"
                    id="date"
                    required
                    value={formData.date}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-navy-500 focus:border-navy-500 block w-full sm:text-sm border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <div className="mt-1">
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-navy-500 focus:border-navy-500 block w-full sm:text-sm border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Tags</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-navy-100 text-navy-800"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-2 text-navy-600 hover:text-navy-800"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Add a tag"
                className="shadow-sm focus:ring-navy-500 focus:border-navy-500 block w-full sm:text-sm border-gray-300 rounded-md px-3 py-2"
              />
              <button
                type="button"
                onClick={addTag}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-navy-600 hover:bg-navy-700"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Featured Image */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Featured Image</h2>
            <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                {formData.image ? (
                  <div className="relative inline-block">
                    <img
                      src={getImageUrl(formData.image) || formData.image}
                      alt="Preview"
                      className="mx-auto h-48 w-auto rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/2666598/pexels-photo-2666598.jpeg';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                      className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-100 rounded-full p-1 hover:bg-red-200"
                    >
                      <XCircle className="h-4 w-4 text-red-600" />
                    </button>
                  </div>
                ) : (
                  <>
                    <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="image-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-navy-600 hover:text-navy-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-navy-500"
                      >
                        <span>Upload a file</span>
                        <input
                          id="image-upload"
                          name="image-upload"
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={handleImageUpload}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Editor */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Content *</h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => addContentItem('paragraph')}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Paragraph
                </button>
                <button
                  type="button"
                  onClick={() => addContentItem('heading')}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Heading
                </button>
                <button
                  type="button"
                  onClick={() => addContentItem('list')}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  List
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {formData.content.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {item.type}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeContentItem(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {item.type === 'list' ? (
                    <div className="space-y-2">
                      {item.items?.map((listItem, itemIndex) => (
                        <div key={itemIndex} className="flex gap-2">
                          <input
                            type="text"
                            value={listItem}
                            onChange={(e) => updateListItem(index, itemIndex, e.target.value)}
                            className="flex-1 shadow-sm focus:ring-navy-500 focus:border-navy-500 block w-full sm:text-sm border-gray-300 rounded-md px-3 py-2"
                            placeholder="List item"
                          />
                          <button
                            type="button"
                            onClick={() => removeListItem(index, itemIndex)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <XCircle className="h-5 w-5" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addListItem(index)}
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-navy-600 hover:text-navy-800"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Item
                      </button>
                    </div>
                  ) : (
                    <textarea
                      value={item.text || ''}
                      onChange={(e) => updateContentItem(index, 'text', e.target.value)}
                      rows={item.type === 'heading' ? 2 : 4}
                      className="shadow-sm focus:ring-navy-500 focus:border-navy-500 block w-full sm:text-sm border-gray-300 rounded-md px-3 py-2"
                      placeholder={item.type === 'heading' ? 'Enter heading text' : 'Enter paragraph text'}
                    />
                  )}
                </div>
              ))}
            </div>

            {formData.content.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                Click "Paragraph", "Heading", or "List" to add content
              </p>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/blogs')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-navy-600 hover:bg-navy-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                {isEditing ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {isEditing ? 'Update Post' : 'Create Post'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BlogForm;
