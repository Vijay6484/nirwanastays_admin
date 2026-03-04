import React, { useState, useEffect } from 'react';
import {
  Users as UsersIcon,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  XCircle,
  User,
  Save,
  Loader,
  Users2Icon,
  Phone,
} from 'lucide-react';

// User Interface
interface User {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  role: string;
  status: string;
  lastLogin?: string;
  avatar?: string;
}

// User Form Data Interface
interface UserData {
  name: string;
  email: string;
  phoneNumber: string;
  role: string;
  status: string;
  avatar?: string;
  password?: string;
  confirmPassword?: string;
}

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserData>({
    name: '',
    email: '',
    phoneNumber: '',
    role: 'staff',
    status: 'active',
    avatar: '',
    password: '',
    confirmPassword: '',
  });

  const [filters, setFilters] = useState({
    role: '',
    status: '',
  });

  // Fetch users from the server
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://api.nirwanastays.com/admin/users');
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        setDeletingId(id);
        const response = await fetch(`https://api.nirwanastays.com/admin/users/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('Failed to delete user');
        }
        setUsers(users.filter((user) => user.id !== id));
      } catch (err) {
        console.error('Error deleting user:', err);
        setError('Failed to delete user');
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      status: user.status,
      avatar: user.avatar || '',
      password: '',
      confirmPassword: '',
    });
    setShowModal(true);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const url = editingUser 
        ? `https://api.nirwanastays.com/admin/users/${editingUser.id}`
        : 'https://api.nirwanastays.com/admin/users';

      const method = editingUser ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(editingUser ? 'Failed to update user' : 'Failed to create user');
      }

      const updatedUser = await response.json();
      
      if (editingUser) {
        setUsers(users.map(user => user.id === editingUser.id ? updatedUser : user));
      } else {
        setUsers([...users, updatedUser]);
      }

      // Reset form and close modal
      setFormData({
        name: '',
        email: '',
        phoneNumber: '',
        role: 'staff',
        status: 'active',
        avatar: '',
        password: '',
        confirmPassword: '',
      });
      setEditingUser(null);
      setShowModal(false);
    } catch (err) {
      console.error('Error saving user:', err);
      setError(editingUser ? 'Failed to update user' : 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = !filters.role || user.role === filters.role;
    const matchesStatus = !filters.status || user.status === filters.status;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleColor = (role: string): string => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'manager':
        return 'bg-blue-100 text-blue-800';
      case 'staff':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="space-y-6">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Users</h1>
              <p className="mt-1 text-sm text-gray-500">Manage system users and their permissions</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <button
                onClick={() => {
                  setEditingUser(null);
                  setFormData({
                    name: '',
                    email: '',
                    phoneNumber: '',
                    role: 'staff',
                    status: 'active',
                    avatar: '',
                    password: '',
                    confirmPassword: '',
                  });
                  setShowModal(true);
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </button>
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
                placeholder="Search users by name, email, or phone..."
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
            <button
              type="button"
              onClick={() => setFilterOpen(!filterOpen)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </button>
          </div>

          {/* Filter Panel */}
          {filterOpen && (
            <div className="bg-white p-4 rounded-md shadow space-y-4">
              <h3 className="font-medium text-gray-700">Filter Options</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={filters.role}
                    onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="staff">Staff</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setFilters({ role: '', status: '' })}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setFilterOpen(false)}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Apply
                </button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && !showModal && (
            <div className="flex justify-center items-center h-64">
              <Loader className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Loading users...</span>
            </div>
          )}

          {/* Users Table */}
          {!loading && (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Status
                      </th>
                      
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <img
                                className="h-10 w-10 rounded-full object-cover"
                                src={user.avatar || 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg'}
                                alt={user.name}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg';
                                }}
                              />
                            </div>
                            <div className="ml-4 min-w-0">
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-500 truncate">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-500">
                            <Phone className="h-4 w-4 mr-1" />
                            {user.phoneNumber}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(
                              user.role
                            )}`}
                          >
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                              user.status
                            )}`}
                          >
                            {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                          </span>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button 
                              onClick={() => handleEdit(user)} 
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Edit className="h-5 w-5" />
                            </button>
                            <button 
                              onClick={() => handleDelete(user.id)} 
                              disabled={deletingId === user.id}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50"
                            >
                              {deletingId === user.id ? (
                                <Loader className="h-5 w-5 animate-spin" />
                              ) : (
                                <Trash2 className="h-5 w-5" />
                              )}
                            </button>
                            <button className="text-gray-600 hover:text-gray-900">
                              <Eye className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredUsers.length === 0 && (
            <div className="text-center py-10">
              <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || filters.role || filters.status
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Get started by creating your first user.'}
              </p>
              {!searchTerm && !filters.role && !filters.status && (
                <div className="mt-6">
                  <button
                    onClick={() => {
                      setEditingUser(null);
                      setShowModal(true);
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add User
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Modal for Add/Edit User */}
          {showModal && (
            <div className="fixed inset-0 overflow-y-auto z-50">
              <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                  <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                </div>
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
                  &#8203;
                </span>
                <div
                  className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="modal-headline"
                >
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                      <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                        <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-headline">
                          {editingUser ? 'Edit User' : 'Add New User'}
                        </h3>
                        <div className="mt-2">
                          <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                              <div className="bg-red-50 border-l-4 border-red-500 p-4">
                                <div className="flex">
                                  <div className="flex-shrink-0">
                                    <User className="h-5 w-5 text-red-500" />
                                  </div>
                                  <div className="ml-3">
                                    <p className="text-sm text-red-700">{error}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                            <div>
                              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Full Name *
                              </label>
                              <div className="mt-1">
                                <input
                                  type="text"
                                  name="name"
                                  id="name"
                                  required
                                  value={formData.name}
                                  onChange={handleChange}
                                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
                                />
                              </div>
                            </div>
                            <div>
                              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email Address *
                              </label>
                              <div className="mt-1">
                                <input
                                  type="email"
                                  name="email"
                                  id="email"
                                  required
                                  value={formData.email}
                                  onChange={handleChange}
                                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
                                />
                              </div>
                            </div>
                            <div>
                              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                                Phone Number *
                              </label>
                              <div className="mt-1">
                                <input
                                  type="tel"
                                  name="phoneNumber"
                                  id="phoneNumber"
                                  required
                                  value={formData.phoneNumber}
                                  onChange={handleChange}
                                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
                                />
                              </div>
                            </div>
                            <div>
                              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                                Role *
                              </label>
                              <div className="mt-1">
                                <select
                                  id="role"
                                  name="role"
                                  required
                                  value={formData.role}
                                  onChange={handleChange}
                                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
                                >
                                  <option value="admin">Admin</option>
                                  <option value="manager">Manager</option>
                                  <option value="staff">Staff</option>
                                </select>
                              </div>
                            </div>
                            <div>
                              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                                Status *
                              </label>
                              <div className="mt-1">
                                <select
                                  id="status"
                                  name="status"
                                  required
                                  value={formData.status}
                                  onChange={handleChange}
                                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
                                >
                                  <option value="active">Active</option>
                                  <option value="inactive">Inactive</option>
                                  <option value="suspended">Suspended</option>
                                </select>
                              </div>
                            </div>
                            <div>
                              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                {editingUser ? 'New Password' : 'Password *'}
                              </label>
                              <div className="mt-1">
                                <input
                                  type="password"
                                  name="password"
                                  id="password"
                                  required={!editingUser}
                                  value={formData.password}
                                  onChange={handleChange}
                                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
                                />
                              </div>
                            </div>
                            <div>
                              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                {editingUser ? 'Confirm New Password' : 'Confirm Password *'}
                              </label>
                              <div className="mt-1">
                                <input
                                  type="password"
                                  name="confirmPassword"
                                  id="confirmPassword"
                                  required={!editingUser}
                                  value={formData.confirmPassword}
                                  onChange={handleChange}
                                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
                                />
                              </div>
                            </div>
                            <div className="flex justify-end space-x-3">
                              <button
                                type="button"
                                onClick={() => {
                                  setShowModal(false);
                                  setEditingUser(null);
                                }}
                                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                disabled={loading}
                                className="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:col-start-2 sm:text-sm disabled:opacity-50"
                              >
                                {loading ? (
                                  <>
                                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                                    {editingUser ? 'Updating...' : 'Creating...'}
                                  </>
                                ) : (
                                  <>
                                    <Save className="h-4 w-4 mr-2" />
                                    {editingUser ? 'Update User' : 'Create User'}
                                  </>
                                )}
                              </button>
                            </div>
                          </form>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Users;