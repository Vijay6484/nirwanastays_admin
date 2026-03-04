import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus, Search, Trash2, Edit2, XCircle, AlertCircle, CheckCircle,
  Calendar, Users, Percent, Copy, Check as CheckIcon, IndianRupee
} from 'lucide-react';
import axios from 'axios';

interface Coupon {
  id: number;
  name: string;
  code: string;
  discount: number;
  discountType: 'percentage' | 'fixed';
  minAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  active: boolean;
  expiryDate: string;
  createdAt: string;
  updatedAt: string;
  accommodationType?: string; // <-- Add this line
}

interface CouponFormData {
  id?: number;
  code: string;
  discount: number;
  discountType: 'percentage' | 'fixed';
  minAmount?: string;
  maxDiscount?: string;
  usageLimit?: string;
  active: boolean;
  expiryDate: string;
  accommodationType?: string; // <-- Add this line
}

interface Accommodation {
  id: number;
  name: string
}
const API_BASE_URL = 'https://api.nirwanastays.com/admin';

const defaultCoupon: CouponFormData = {
  code: '',
  discount: 0,
  discountType: 'percentage',
  minAmount: '',
  maxDiscount: '',
  usageLimit: '',
  active: true,
  expiryDate: '',
  accommodationType: 'all', // <-- Add this line
};

const Coupons: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<CouponFormData | null>(null);
  const [newCoupon, setNewCoupon] = useState<CouponFormData>({ ...defaultCoupon });
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [accommodation, setAccommodation] = useState<Accommodation[]>([]); // <-- Add this line
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive' | 'expired'>('all');

  const fetchAccommodation = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/properties/accommodations`);
      console.log('Accommodation response:', response.data);

      const accommodations = response.data?.data;

      if (Array.isArray(accommodations)) {
        const simplified = accommodations.map((acc: any) => ({
          id: acc.id,
          name: acc.name,
        }));
        console.log('Fetched accommodations:', simplified);
        setAccommodation(simplified);
      } else {
        console.error('No accommodations found or invalid response shape');
        setError('No accommodations found');
      }
    } catch (error) {
      console.error('Request error:', error);
      setError('Failed to connect to server');
    }
  }, []);

  const fetchCoupons = useCallback(async (search?: string) => {
    try {
      setLoading(true);
      setError('');
      const url = search
        ? `${API_BASE_URL}/coupons?search=${encodeURIComponent(search)}`
        : `${API_BASE_URL}/coupons`;
      const response = await fetch(url);
      const data = await response.json();
      console.log('Coupons response:', data);
      if (data.success && Array.isArray(data.data)) {
        setCoupons(
          data.data.map((c: any) => ({
            id: c.id,
            name: c.name,
            code: c.code,
            discount: parseFloat(c.discount),
            discountType: c.discountType,
            minAmount: c.minAmount ? parseFloat(c.minAmount) : undefined,
            maxDiscount: c.maxDiscount ? parseFloat(c.maxDiscount) : undefined,
            usageLimit: c.usageLimit ? parseInt(c.usageLimit) : undefined,
            usedCount: c.usedCount ? parseInt(c.usedCount) : 0,
            active: !!c.active,
            expiryDate: c.expiryDate,
            createdAt: c.createdAt,
            updatedAt: c.updatedAt,
            accommodationType: c.accommodationType || 'all', // <-- Add this line
          }))
        );
      } else {
        setCoupons([]);
        setError(data.message || 'Failed to fetch coupons');
      }
      // console.log('Fetched coupons:', data);

    } catch (error) {
      setError('Failed to connect to server');
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
    fetchAccommodation(); // Fetch accommodation data on component mount
  }, [fetchCoupons]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.trim()) {
        fetchCoupons(searchTerm);
      } else {
        fetchCoupons();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, fetchCoupons]);

  const showMessage = useCallback((message: string, type: 'success' | 'error') => {
    if (type === 'success') {
      setSuccess(message);
      setError('');
    } else {
      setError(message);
      setSuccess('');
    }

    const timer = setTimeout(() => {
      setSuccess('');
      setError('');
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleToggleStatus = async (id: number) => {
    try {
      setActionLoading(id);
      const response = await fetch(`${API_BASE_URL}/coupons/${id}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showMessage(data.message || 'Coupon status updated successfully', 'success');
        await fetchCoupons();
      } else {
        throw new Error(data.message || 'Failed to update coupon status');
      }
    } catch (error) {
      showMessage(error instanceof Error ? error.message : 'Failed to update coupon status', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this coupon? This action cannot be undone.')) {
      return;
    }

    try {
      setActionLoading(id);
      const response = await fetch(`${API_BASE_URL}/coupons/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showMessage(data.message || 'Coupon deleted successfully', 'success');
        await fetchCoupons();
      } else {
        throw new Error(data.message || 'Failed to delete coupon');
      }
    } catch (error) {
      showMessage(error instanceof Error ? error.message : 'Failed to delete coupon', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const validateCouponForm = (coupon: CouponFormData): string | null => {
    if (!coupon.code.trim()) return 'Coupon code is required';
    if (coupon.discount <= 0) return 'Discount must be greater than 0';
    if (coupon.discountType === 'percentage' && coupon.discount > 100) {
      return 'Percentage discount cannot exceed 100%';
    }
    if (!coupon.expiryDate) return 'Expiry date is required';
    if (new Date(coupon.expiryDate) <= new Date()) {
      return 'Expiry date must be in the future';
    }
    return null;
  };

  const handleAddCoupon = async () => {
    const validationError = validateCouponForm(newCoupon);
    if (validationError) {
      showMessage(validationError, 'error');
      return;
    }

    try {
      setActionLoading(-1);
      const response = await fetch(`${API_BASE_URL}/coupons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: newCoupon.code.trim(),
          discount: Number(newCoupon.discount),                 // ✅ corrected field name
          discountType: newCoupon.discountType,
          minAmount: newCoupon.minAmount ? Number(newCoupon.minAmount) : null,
          maxDiscount: newCoupon.maxDiscount ? Number(newCoupon.maxDiscount) : null,
          usageLimit: newCoupon.usageLimit ? Number(newCoupon.usageLimit) : null,
          active: newCoupon.active,
          expiryDate: newCoupon.expiryDate,
          accommodationType: newCoupon.accommodationType || 'all',
        }),

      });

      const data = await response.json();

      if (response.ok && data.success) {
        showMessage(data.message || 'Coupon created successfully', 'success');
        setShowAddModal(false);
        setNewCoupon({ ...defaultCoupon });
        await fetchCoupons();
      } else {
        throw new Error(data.message || 'Failed to create coupon');
      }
    } catch (error) {
      showMessage(error instanceof Error ? error.message : 'Failed to create coupon', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleEditCoupon = async () => {
    if (!editingCoupon) return;

    const validationError = validateCouponForm(editingCoupon);
    if (validationError) {
      showMessage(validationError, 'error');
      return;
    }

    try {
      setActionLoading(editingCoupon.id || 0);
      const response = await fetch(`${API_BASE_URL}/coupons/${editingCoupon.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: editingCoupon.code.trim(),
          discount: Number(editingCoupon.discount),             // ✅ Correct key!
          discountType: editingCoupon.discountType,
          minAmount: editingCoupon.minAmount ? Number(editingCoupon.minAmount) : null,
          maxDiscount: editingCoupon.maxDiscount ? Number(editingCoupon.maxDiscount) : null,
          usageLimit: editingCoupon.usageLimit ? Number(editingCoupon.usageLimit) : null,
          active: editingCoupon.active,
          expiryDate: editingCoupon.expiryDate,
          accommodationType: editingCoupon.accommodationType || 'all',
        }),

      });

      const data = await response.json();

      if (response.ok && data.success) {
        showMessage(data.message || 'Coupon updated successfully', 'success');
        setShowEditModal(false);
        setEditingCoupon(null);
        await fetchCoupons();
      } else {
        throw new Error(data.message || 'Failed to update coupon');
      }
    } catch (error) {
      showMessage(error instanceof Error ? error.message : 'Failed to update coupon', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const openEditModal = (coupon: Coupon) => {
    setEditingCoupon({
      id: coupon.id,
      code: coupon.code,
      discount: coupon.discount,
      discountType: coupon.discountType,
      minAmount: coupon.minAmount?.toString() || '',
      maxDiscount: coupon.maxDiscount?.toString() || '',
      usageLimit: coupon.usageLimit?.toString() || '',
      active: coupon.active,
      expiryDate: coupon.expiryDate ? coupon.expiryDate.split('T')[0] : '',
      accommodationType: coupon.accommodationType || 'all', // <-- Add this line
    });
    setShowEditModal(true);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(text);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      showMessage('Failed to copy to clipboard', 'error');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isExpired = (dateString: string) => {
    return new Date(dateString) < new Date();
  };

  const getFilteredCoupons = () => {
    let filtered = coupons.filter(coupon =>
      coupon.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    switch (filter) {
      case 'active':
        return filtered.filter(coupon => coupon.active && !isExpired(coupon.expiryDate));
      case 'inactive':
        return filtered.filter(coupon => !coupon.active);
      case 'expired':
        return filtered.filter(coupon => isExpired(coupon.expiryDate));
      default:
        return filtered;
    }
  };

  const filteredCoupons = getFilteredCoupons();

  const getUsagePercentage = (used: number, limit?: number) => {
    if (!limit) return 0;
    return Math.min((used / limit) * 100, 100);
  };

  return (
    <div className="space-y-6 pb-16 md:pb-0 max-w-7xl mx-auto p-4">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Coupon Management</h1>
          <p className="mt-2 text-sm text-gray-600">
            Create and manage discount coupons for your business
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={() => fetchCoupons()}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Coupon
          </button>
        </div>
      </div>

      {success && (
        <div className="rounded-md bg-green-50 p-4 border border-green-200">
          <div className="flex">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">{success}</p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-md bg-red-50 p-4 border border-red-200">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <div className="flex justify-between">
                <p className="text-sm font-medium text-red-800">{error}</p>
                <button
                  onClick={() => setError('')}
                  className="text-red-600 hover:text-red-800"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
        <div className="relative flex-1 min-w-0">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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

        <div className="flex space-x-2">
          {(['all', 'active', 'inactive', 'expired'] as const).map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${filter === filterType
                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
            >
              {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Coupons</p>
              <p className="text-2xl font-bold text-gray-900">{coupons.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-gray-900">
                {coupons.filter(c => c.active && !isExpired(c.expiryDate)).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Expired</p>
              <p className="text-2xl font-bold text-gray-900">
                {coupons.filter(c => isExpired(c.expiryDate)).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Users className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Usage</p>
              <p className="text-2xl font-bold text-gray-900">
                {coupons.reduce((sum, c) => sum + c.usedCount, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-sm text-gray-500">Loading coupons...</p>
        </div>
      )}

      {!loading && (
        <div className="bg-white shadow rounded-lg overflow-hidden border">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sr No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conditions</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usage</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCoupons.map((coupon, index) => {
                  const expired = isExpired(coupon.expiryDate);
                  const usagePercentage = getUsagePercentage(coupon.usedCount, coupon.usageLimit);

                  return (
                    <tr key={coupon.id} className={`${expired ? 'bg-red-50' : ''} hover:bg-gray-50 transition-colors`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-mono font-medium text-gray-900 bg-gray-100 px-2 py-1 rounded">
                            {coupon.code}
                          </span>
                          <button
                            onClick={() => copyToClipboard(coupon.code)}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                            title="Copy code"
                          >
                            {copiedCode === coupon.code ? (
                              <CheckIcon className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-900 mr-1">
                            {coupon.discount}
                          </span>
                          {coupon.discountType === 'percentage' ? (
                            <Percent className="h-4 w-4 text-green-500" />
                          ) : (
                            <IndianRupee className="h-4 w-4 text-blue-500" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                        <div className="space-y-1">
                          {coupon.minAmount && (
                            <div>Min: ₹{coupon.minAmount}</div>
                          )}
                          {coupon.maxDiscount && (
                            <div>Max: ₹{coupon.maxDiscount}</div>
                          )}
                          {!coupon.minAmount && !coupon.maxDiscount && (
                            <div className="text-gray-400">No conditions</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          <div className="flex flex-col">
                            <span className="text-sm text-gray-500">
                              {coupon.usedCount}{coupon.usageLimit ? `/${coupon.usageLimit}` : ''}
                            </span>
                            {coupon.usageLimit && (
                              <div className="w-16 bg-gray-200 rounded-full h-1 mt-1">
                                <div
                                  className={`h-1 rounded-full transition-all ${usagePercentage >= 90 ? 'bg-red-500' :
                                    usagePercentage >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                                    }`}
                                  style={{ width: `${usagePercentage}%` }}
                                ></div>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className={`text-sm ${expired ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                            {formatDate(coupon.expiryDate)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleStatus(coupon.id)}
                          disabled={expired || actionLoading === coupon.id}
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${expired
                            ? 'bg-red-100 text-red-800 cursor-not-allowed'
                            : coupon.active
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                            }`}
                        >
                          {actionLoading === coupon.id ? (
                            <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin mr-1"></div>
                          ) : expired ? (
                            'Expired'
                          ) : coupon.active ? (
                            'Active'
                          ) : (
                            'Inactive'
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openEditModal(coupon)}
                            disabled={actionLoading === coupon.id}
                            className="text-blue-600 hover:text-blue-900 disabled:opacity-50 transition-colors"
                            title="Edit Coupon"
                          >
                            <Edit2 className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(coupon.id)}
                            disabled={actionLoading === coupon.id}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50 transition-colors"
                            title="Delete Coupon"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                    <Plus className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Add New Coupon
                    </h3>
                    <div className="mt-4">
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                            Coupon Code
                          </label>
                          <input
                            type="text"
                            name="code"
                            id="code"
                            value={newCoupon.code}
                            onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="discount" className="block text-sm font-medium text-gray-700">
                            Discount Value
                          </label>
                          <div className="mt-1 relative rounded-md shadow-sm">
                            <input
                              type="number"
                              name="discount"
                              id="discount"
                              value={newCoupon.discount}
                              onChange={(e) => setNewCoupon({ ...newCoupon, discount: parseFloat(e.target.value) || 0 })}
                              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 pr-20 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              required
                              min="0"
                              step="0.01"
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                              <select
                                value={newCoupon.discountType}
                                onChange={(e) => setNewCoupon({ ...newCoupon, discountType: e.target.value as 'percentage' | 'fixed' })}
                                className="focus:ring-blue-500 focus:border-blue-500 h-full py-0 pl-2 pr-7 border-transparent bg-transparent text-gray-500 sm:text-sm rounded-md"
                              >
                                <option value="percentage">%</option>
                                <option value="fixed">₹</option>
                              </select>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="minAmount" className="block text-sm font-medium text-gray-700">
                              Minimum Amount
                            </label>
                            <input
                              type="number"
                              name="minAmount"
                              id="minAmount"
                              value={newCoupon.minAmount}
                              onChange={(e) => setNewCoupon({ ...newCoupon, minAmount: e.target.value })}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              min="0"
                              step="0.01"
                              placeholder="Optional"
                            />
                          </div>
                          <div>
                            <label htmlFor="maxDiscount" className="block text-sm font-medium text-gray-700">
                              Maximum Discount
                            </label>
                            <input
                              type="number"
                              name="maxDiscount"
                              id="maxDiscount"
                              value={newCoupon.maxDiscount}
                              onChange={(e) => setNewCoupon({ ...newCoupon, maxDiscount: e.target.value })}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              min="0"
                              step="0.01"
                              placeholder="Optional"
                            />
                          </div>
                        </div>
                        <div>
                          <label htmlFor="usageLimit" className="block text-sm font-medium text-gray-700">
                            Usage Limit
                          </label>
                          <input
                            type="number"
                            name="usageLimit"
                            id="usageLimit"
                            value={newCoupon.usageLimit}
                            onChange={(e) => setNewCoupon({ ...newCoupon, usageLimit: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            min="0"
                            placeholder="Optional"
                          />
                        </div>
                        <div>
                          <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">
                            Expiry Date
                          </label>
                          <input
                            type="date"
                            name="expiryDate"
                            id="expiryDate"
                            value={newCoupon.expiryDate}
                            onChange={(e) => setNewCoupon({ ...newCoupon, expiryDate: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            required
                            min={new Date().toISOString().split('T')[0]}
                          />
                        </div>
                        <div>
                          <label htmlFor="accommodationType" className="block text-sm font-medium text-gray-700">
                            Accommodation
                          </label>
                          <select
                            id="accommodationType"
                            name="accommodationType"
                            value={newCoupon.accommodationType || 'all'}
                            onChange={(e) => setNewCoupon({ ...newCoupon, accommodationType: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            required
                          >
                            <option value="all">All</option>
                            {accommodation.map((acc) => (
                              <option key={acc.id} value={acc.name}>
                                {acc.name}
                              </option>
                            ))}
                          </select>

                        </div>
                        <div className="flex items-center">
                          <input
                            id="active"
                            name="active"
                            type="checkbox"
                            checked={newCoupon.active}
                            onChange={(e) => setNewCoupon({ ...newCoupon, active: e.target.checked })}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="active" className="ml-2 block text-sm text-gray-700">
                            Active
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddCoupon}
                  disabled={actionLoading === -1}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  {actionLoading === -1 ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Creating...
                    </div>
                  ) : (
                    'Create Coupon'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEditModal && editingCoupon && (
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                    <Edit2 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Edit Coupon
                    </h3>
                    <div className="mt-4">
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="edit-code" className="block text-sm font-medium text-gray-700">
                            Coupon Code
                          </label>
                          <input
                            type="text"
                            name="edit-code"
                            id="edit-code"
                            value={editingCoupon.code}
                            onChange={(e) => setEditingCoupon({ ...editingCoupon, code: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="edit-discount" className="block text-sm font-medium text-gray-700">
                            Discount Value
                          </label>
                          <div className="mt-1 relative rounded-md shadow-sm">
                            <input
                              type="number"
                              name="edit-discount"
                              id="edit-discount"
                              value={editingCoupon.discount}
                              onChange={(e) => setEditingCoupon({ ...editingCoupon, discount: parseFloat(e.target.value) || 0 })}
                              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 pr-20 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              required
                              min="0"
                              step="0.01"
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                              <select
                                value={editingCoupon.discountType}
                                onChange={(e) => setEditingCoupon({ ...editingCoupon, discountType: e.target.value as 'percentage' | 'fixed' })}
                                className="focus:ring-blue-500 focus:border-blue-500 h-full py-0 pl-2 pr-7 border-transparent bg-transparent text-gray-500 sm:text-sm rounded-md"
                              >
                                <option value="percentage">%</option>
                                <option value="fixed">₹</option>
                              </select>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="edit-minAmount" className="block text-sm font-medium text-gray-700">
                              Minimum Amount
                            </label>
                            <input
                              type="number"
                              name="edit-minAmount"
                              id="edit-minAmount"
                              value={editingCoupon.minAmount}
                              onChange={(e) => setEditingCoupon({ ...editingCoupon, minAmount: e.target.value })}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              min="0"
                              step="0.01"
                              placeholder="Optional"
                            />
                          </div>
                          <div>
                            <label htmlFor="edit-maxDiscount" className="block text-sm font-medium text-gray-700">
                              Maximum Discount
                            </label>
                            <input
                              type="number"
                              name="edit-maxDiscount"
                              id="edit-maxDiscount"
                              value={editingCoupon.maxDiscount}
                              onChange={(e) => setEditingCoupon({ ...editingCoupon, maxDiscount: e.target.value })}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              min="0"
                              step="0.01"
                              placeholder="Optional"
                            />
                          </div>
                        </div>
                        <div>
                          <label htmlFor="edit-usageLimit" className="block text-sm font-medium text-gray-700">
                            Usage Limit
                          </label>
                          <input
                            type="number"
                            name="edit-usageLimit"
                            id="edit-usageLimit"
                            value={editingCoupon.usageLimit}
                            onChange={(e) => setEditingCoupon({ ...editingCoupon, usageLimit: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            min="0"
                            placeholder="Optional"
                          />
                        </div>
                        <div>
                          <label htmlFor="edit-expiryDate" className="block text-sm font-medium text-gray-700">
                            Expiry Date
                          </label>
                          <input
                            type="date"
                            name="edit-expiryDate"
                            id="edit-expiryDate"
                            value={editingCoupon.expiryDate}
                            onChange={(e) => setEditingCoupon({ ...editingCoupon, expiryDate: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            required
                            min={new Date().toISOString().split('T')[0]}
                          />
                        </div>
                        <div>
                          <label htmlFor="edit-accommodationType" className="block text-sm font-medium text-gray-700">
                            Accommodation
                          </label>
                          <select
                            id="edit-accommodationType"
                            name="edit-accommodationType"
                            value={editingCoupon.accommodationType}
                            onChange={(e) => setEditingCoupon({ ...editingCoupon, accommodationType: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            required
                          >
                            <option value="all">All</option>
                            {accommodation.map((acc) => (
                              <option key={acc.id} value={acc.name}>
                                {acc.name}
                              </option>
                            ))}
                          </select>


                        </div>
                        <div className="flex items-center">
                          <input
                            id="edit-active"
                            name="edit-active"
                            type="checkbox"
                            checked={editingCoupon.active}
                            onChange={(e) => setEditingCoupon({ ...editingCoupon, active: e.target.checked })}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="edit-active" className="ml-2 block text-sm text-gray-700">
                            Active
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleEditCoupon}
                  disabled={actionLoading === editingCoupon.id}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  {actionLoading === editingCoupon.id ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Updating...
                    </div>
                  ) : (
                    'Update Coupon'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Coupons;
