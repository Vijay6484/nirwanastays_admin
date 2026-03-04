import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Image, 
  Coffee, 
  Calendar, 
  TrendingUp, 
  Users, 
  DollarSign,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

// StatCard Component
type StatCardProps = {
  title: string;
  value: string | number;
  change: string;
  icon: React.ReactNode;
  trend: 'up' | 'down';
  loading?: boolean;
};

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon, trend, loading = false }) => {
  const isPositive = trend === 'up';
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
          {loading ? (
            <div className="animate-pulse h-8 w-3/4 bg-gray-200 rounded mt-2"></div>
          ) : (
            <p className="text-3xl font-bold text-gray-900">{value}</p>
          )}
        </div>
        <div className="flex-shrink-0">
          {icon}
        </div>
      </div>
      <div className="mt-4 flex items-center">
        {loading ? (
          <div className="animate-pulse h-4 w-full bg-gray-200 rounded"></div>
        ) : (
          <>
            <div className={`flex items-center text-sm ${
              isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingUp className="h-4 w-4 mr-1" />
              <span className="font-medium">{change}</span>
            </div>
            <span className="text-sm text-gray-500 ml-2">from last month</span>
          </>
        )}
      </div>
    </div>
  );
};

// RecentBookingsTable Component
type Booking = {
  id: string | number;
  guestName: string;
  email: string;
  accommodation: string;
  checkIn: string;
  amount: string | number;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
};

type RecentBookingsTableProps = {
  bookings: Booking[];
  loading: boolean;
  error?: string | null;
  onRetry?: () => void;
};

const RecentBookingsTable: React.FC<RecentBookingsTableProps> = ({ 
  bookings, 
  loading, 
  error,
  onRetry 
}) => {
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: string | number): string => {
    return `₹${parseFloat(amount as string).toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="px-4 py-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-500">Loading bookings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-8 text-center">
        <div className="flex flex-col items-center justify-center">
          <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
          <p className="text-red-500 mb-4">{error}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!bookings || bookings.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-gray-500">
        No recent bookings found
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Guest
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Accommodation
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Check-in
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {bookings.map((booking) => (
            <tr key={booking.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {booking.guestName}
                  </div>
                  <div className="text-sm text-gray-500">
                    {booking.email}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {booking.accommodation}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatDate(booking.checkIn)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {formatCurrency(booking.amount)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// QuickAccessCard Component
type QuickAccessCardProps = {
  title: string;
  count: number;
  icon: React.ReactNode;
  link: string;
  loading: boolean;
};

const QuickAccessCard: React.FC<QuickAccessCardProps> = ({ title, count, icon, link, loading }) => {
  return (
    <a 
      href={link}
      className="bg-white rounded-lg shadow p-4 transition-all hover:shadow-lg hover:-translate-y-1"
    >
      <div className="flex flex-col items-center text-center">
        <div className="mb-2">{icon}</div>
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        {loading ? (
          <div className="animate-pulse bg-gray-200 h-8 w-12 rounded mt-1"></div>
        ) : (
          <p className="text-2xl font-bold text-blue-900 mt-1">{count}</p>
        )}
      </div>
    </a>
  );
};

// Main Dashboard Component
const Dashboard = () => {
  const [stats, setStats] = useState({
    totalBookings: '0',
    bookingChange: '+0%',
    occupancyRate: '0%',
    occupancyChange: '+0%',
    revenue: '₹0',
    revenueChange: '+0%',
    websiteVisitors: '0',
    visitorsChange: '+0%'
  });
  
  const [quickStats, setQuickStats] = useState({
    accommodations: 0,
    gallery: 0,
    services: 0,
    todayBookings: 0
  });
  
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [loadingStates, setLoadingStates] = useState({
    stats: true,
    quickStats: true,
    recentBookings: true
  });
  const [errors, setErrors] = useState({
    stats: null as string | null,
    quickStats: null as string | null,
    recentBookings: null as string | null
  });

  const admin_BASE_URL = 'https://api.nirwanastays.com/admin';
  const RETRY_DELAY = 3000; // 3 seconds
  const MAX_RETRIES = 3;
  const REQUEST_TIMEOUT = 8000; // 8 seconds

  // Enhanced fetch with timeout and retry
  const fetchWithRetry = async (endpoint: string, retries = MAX_RETRIES): Promise<any> => {
    // Commented out API calls - return mock data instead
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
      
      const response = await fetch(`${admin_BASE_URL}${endpoint}`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return fetchWithRetry(endpoint, retries - 1);
      }
      throw err;
    }
    
    // Return mock data based on endpoint
    // if (endpoint.includes('stats')) {
    //   return {
    //     totalBookings: '156',
    //     bookingChange: '+12%',
    //     occupancyRate: '78%',
    //     occupancyChange: '+5%',
    //     revenue: '₹2,45,000',
    //     revenueChange: '+18%',
    //     websiteVisitors: '1,234',
    //     visitorsChange: '+8%'
    //   };
    // } else if (endpoint.includes('quick-stats')) {
    //   return {
    //     accommodations: 12,
    //     gallery: 45,
    //     services: 8,
    //     todayBookings: 5
    //   };
    // } else if (endpoint.includes('recent-bookings')) {
    //   return [
    //     {
    //       id: 1,
    //       guestName: 'Rahul Sharma',
    //       email: 'rahul@example.com',
    //       accommodation: 'Lake View Villa',
    //       checkIn: '2025-01-20',
    //       amount: '38500',
    //       status: 'confirmed'
    //     },
    //     {
    //       id: 2,
    //       guestName: 'Priya Patel',
    //       email: 'priya@example.com',
    //       accommodation: 'Garden Suite',
    //       checkIn: '2025-01-21',
    //       amount: '25200',
    //       status: 'pending'
    //     }
    //   ];
    // }
    // return {};
  };

  // Fetch dashboard stats
  const fetchStats = async () => {
    try {
      setLoadingStates(prev => ({ ...prev, stats: true }));
      setErrors(prev => ({ ...prev, stats: null }));
      const data = await fetchWithRetry('/dashboard/stats');
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setErrors(prev => ({ ...prev, stats: 'Failed to load dashboard stats. Please try again.' }));
    } finally {
      setLoadingStates(prev => ({ ...prev, stats: false }));
    }
  };

  // Fetch quick access stats
  const fetchQuickStats = async () => {
    try {
      setLoadingStates(prev => ({ ...prev, quickStats: true }));
      setErrors(prev => ({ ...prev, quickStats: null }));
      const data = await fetchWithRetry('/dashboard/quick-stats');
      setQuickStats(data);
    } catch (err) {
      console.error('Error fetching quick stats:', err);
      setErrors(prev => ({ ...prev, quickStats: 'Failed to load quick stats. Please try again.' }));
    } finally {
      setLoadingStates(prev => ({ ...prev, quickStats: false }));
    }
  };

  // Fetch recent bookings
  const fetchRecentBookings = async () => {
    try {
      setLoadingStates(prev => ({ ...prev, recentBookings: true }));
      setErrors(prev => ({ ...prev, recentBookings: null }));
      const data = await fetchWithRetry('/dashboard/recent-bookings');
      setRecentBookings(data);
    } catch (err) {
      console.error('Error fetching recent bookings:', err);
      setErrors(prev => ({ ...prev, recentBookings: 'Failed to load recent bookings. Please try again.' }));
    } finally {
      setLoadingStates(prev => ({ ...prev, recentBookings: false }));
    }
  };

  // Load all data on component mount
  useEffect(() => {
    fetchStats();
    fetchQuickStats();
    fetchRecentBookings();
  }, []);

  // Refresh all data
  const refreshAll = () => {
    fetchStats();
    fetchQuickStats();
    fetchRecentBookings();
  };

  // Check if any component is still loading
  const anyLoading = Object.values(loadingStates).some(state => state);
  const anyError = Object.values(errors).some(error => error !== null);

  return (
    <div className="space-y-6 pb-16 md:pb-0">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">Resort overview and performance metrics</p>
        </div>
        <button
          onClick={refreshAll}
          disabled={anyLoading}
          className="flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${anyLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {anyError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">There were errors loading some data</h3>
              <div className="mt-2 text-sm text-red-700">
                <ul className="list-disc pl-5 space-y-1">
                  {errors.stats && <li>{errors.stats}</li>}
                  {errors.quickStats && <li>{errors.quickStats}</li>}
                  {errors.recentBookings && <li>{errors.recentBookings}</li>}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Bookings" 
          value={stats.totalBookings} 
          change={stats.bookingChange} 
          icon={<Calendar className="h-6 w-6 text-nature-600" />} 
          trend="up" 
          loading={loadingStates.stats}
        />
        <StatCard 
          title="Occupancy Rate" 
          value={stats.occupancyRate} 
          change={stats.occupancyChange} 
          icon={<Building2 className="h-6 w-6 text-amber-600" />} 
          trend="up" 
          loading={loadingStates.stats}
        />
        <StatCard 
          title="Revenue" 
          value={stats.revenue} 
          change={stats.revenueChange} 
          icon={<DollarSign className="h-6 w-6 text-nature-700" />} 
          trend="up" 
          loading={loadingStates.stats}
        />
        <StatCard 
          title="Website Visitors" 
          value={stats.websiteVisitors} 
          change={stats.visitorsChange} 
          icon={<Users className="h-6 w-6 text-nature-500" />} 
          trend="up" 
          loading={loadingStates.stats}
        />
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <QuickAccessCard 
          title="Accommodations" 
          count={quickStats.accommodations} 
          icon={<Building2 className="h-10 w-10 text-nature-600" />} 
          link="/accommodations" 
          loading={loadingStates.quickStats}
        />
        <QuickAccessCard 
          title="Gallery" 
          count={quickStats.gallery} 
          icon={<Image className="h-10 w-10 text-nature-500" />} 
          link="/gallery" 
          loading={loadingStates.quickStats}
        />
        <QuickAccessCard 
          title="Services" 
          count={quickStats.services} 
          icon={<Coffee className="h-10 w-10 text-amber-600" />} 
          link="/services" 
          loading={loadingStates.quickStats}
        />
        <QuickAccessCard 
          title="Today's Bookings" 
          count={quickStats.todayBookings} 
          icon={<Calendar className="h-10 w-10 text-nature-700" />} 
          link="/bookings" 
          loading={loadingStates.quickStats}
        />
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Recent Bookings</h3>
          <p className="mt-1 text-sm text-gray-500">Latest 5 bookings from guests</p>
        </div>
        <RecentBookingsTable 
          bookings={recentBookings} 
          loading={loadingStates.recentBookings} 
          error={errors.recentBookings}
          onRetry={fetchRecentBookings}
        />
      </div>

      {/* Revenue Trend Placeholder */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900">Revenue Trend</h3>
              <p className="mt-1 text-sm text-gray-500">Last 7 days performance</p>
            </div>
            <TrendingUp className="h-6 w-6 text-nature-600" />
          </div>
        </div>
        <div className="p-4 h-64 flex items-center justify-center">
          <p className="text-gray-500">Revenue chart will be displayed here</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;