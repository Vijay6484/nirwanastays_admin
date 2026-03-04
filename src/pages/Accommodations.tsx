import React, { useState, useEffect, useMemo } from "react";
import {
  Building2,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  XCircle,
  Loader,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";
import DOMPurify from "dompurify";
interface Accommodation {
  id: number;
  name: string;
  type: string;
  description: string;
  price: string;
  capacity: number;
  rooms: number;
  available: boolean;
  features: string[];
  images: string[];
  amenities: string[];
  location: {
    address: string;
    coordinates: {
      latitude: number | null;
      longitude: number | null;
    };
  };
  ownerId: number;
  cityId: number;
  package: {
    name: string | null;
    description: string;
    images: string[];
    pricing: {
      adult: string;
      child: string;
      maxGuests: number;
    };
  };
  timestamps: {
    createdAt: string;
    updatedAt: string;
  };
}

interface Pagination {
  total: number;
  totalPages: number;
  currentPage: number;
  perPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface ApiResponse {
  data: Accommodation[];
  pagination: Pagination;
}

interface Filters {
  type: string;
  capacity: string;
  availability: string;
}

const Accommodations: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState<Filters>({
    type: "",
    capacity: "",
    availability: "",
  });
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    totalPages: 1,
    currentPage: 1,
    perPage: 10,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const sanitizeConfig = {
    ALLOWED_TAGS: [
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "strong",
      "em",
      "u",
      "s",
      "p",
      "br",
      "ul",
      "ol",
      "li",
      "a",
    ],
    ALLOWED_ATTR: ["href", "target", "rel"],
  };

  const API_BASE_URL = "https://api.nirwanastays.com/admin/properties";

  // Fetch accommodations from backend
  useEffect(() => {
    fetchAccommodations();
  }, [searchTerm, filters, pagination.currentPage]);

  const fetchAccommodations = async (filterParams: Partial<Filters> = {}) => {
    // Commented out API calls - using mock data instead
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);

      // Add filters
      Object.entries({ ...filters, ...filterParams }).forEach(
        ([key, value]) => {
          if (value) params.append(key, value);
        }
      );

      // Add pagination
      params.append("page", pagination.currentPage.toString());
      params.append("perPage", pagination.perPage.toString());

      const response = await fetch(
        `${API_BASE_URL}/accommodations?${params.toString()}`
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to fetch accommodations");
      }

      const result: ApiResponse = await response.json();
      setAccommodations(result.data);
      setPagination(result.pagination);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      console.error("Error fetching accommodations:", err);
    } finally {
      setLoading(false);
    }

    // Mock data for accommodations
    // setLoading(true);
    // setError('');

    // setTimeout(() => {
    //   const mockAccommodations: Accommodation[] = [
    //     {
    //       id: 1,
    //       name: 'Lake View Villa',
    //       type: 'Villa',
    //       description: 'Beautiful villa with stunning lake views',
    //       price: '15000',
    //       capacity: 6,
    //       rooms: 3,
    //       available: true,
    //       features: ['Lake View', 'Private Pool', 'Garden'],
    //       images: ['https://images.pexels.com/photos/1134176/pexels-photo-1134176.jpeg'],
    //       amenities: ['WiFi', 'AC', 'TV'],
    //       location: { address: 'Lakeside Resort', coordinates: { latitude: null, longitude: null } },
    //       ownerId: 1,
    //       cityId: 1,
    //       package: { name: 'Premium', description: 'Luxury package with all amenities', images: [], pricing: { adult: '5000', child: '2500', maxGuests: 6 } },
    //       timestamps: { createdAt: '2025-01-01', updatedAt: '2025-01-01' }
    //     }
    //   ];

    //   setAccommodations(mockAccommodations);
    //   setPagination({
    //     total: mockAccommodations.length,
    //     totalPages: 1,
    //     currentPage: 1,
    //     perPage: 10,
    //     hasNextPage: false,
    //     hasPrevPage: false
    //   });
    //   setLoading(false);
    // }, 1000);
  };

  const handleDelete = async (id: number) => {
    const isConfirmed = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (!isConfirmed.isConfirmed) return;

    // Commented out API call - using mock deletion
    try {
      await axios.delete(`${API_BASE_URL}/accommodations/${id}`);

      setAccommodations((prev) => prev.filter((acc) => acc.id !== id));

      await Swal.fire(
        "Deleted!",
        "Your accommodation has been deleted.",
        "success"
      );
    } catch (err) {
      Swal.fire("Error!", "Failed to delete accommodation.", "error");
      console.error("Error deleting accommodation:", err);
    }

    // Mock deletion
    // setAccommodations((prev) => prev.filter((acc) => acc.id !== id));
    // await Swal.fire('Deleted!', 'Your accommodation has been deleted.', 'success');
  };

  // Toggle availability
  const toggleAvailability = async (id: number, currentStatus: boolean) => {
    // Commented out API call - using mock toggle
    try {
      const response = await fetch(
        `${API_BASE_URL}/accommodations/${id}/toggle-availability`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ available: !currentStatus }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update availability");
      }

      setAccommodations((prev) =>
        prev.map((acc) =>
          acc.id === id ? { ...acc, available: !currentStatus } : acc
        )
      );
    } catch (err) {
      console.error("Error updating availability:", err);
      Swal.fire("Error!", "Failed to update availability.", "error");
    }

    // // Mock toggle
    // setAccommodations(prev => prev.map(acc =>
    //   acc.id === id ? { ...acc, available: !currentStatus } : acc
    // ));
  };

  // Apply filters
  const applyFilters = () => {
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    fetchAccommodations(filters);
    setFilterOpen(false);
  };

  const resetFilters = () => {
    setFilters({
      type: "",
      capacity: "",
      availability: "",
    });
    setSearchTerm("");
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  // Format price for display
  const formatPrice = (price: string) => {
    const num = parseFloat(price);
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(num);
  };

  // Handle image loading errors
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.src =
      "https://images.pexels.com/photos/1134176/pexels-photo-1134176.jpeg";
    target.onerror = null; // Prevent infinite loop
  };

  // Memoized filter options
  const typeOptions = useMemo(
    () => [
      { value: "", label: "All Types" },
      { value: "Suite", label: "Suite" },
      { value: "Villa", label: "Villa" },
      { value: "Cottage", label: "Cottage" },
      { value: "Bungalow", label: "Bungalow" },
      { value: "Glamping", label: "Glamping" },
    ],
    []
  );

  const capacityOptions = useMemo(
    () => [
      { value: "", label: "Any Capacity" },
      { value: "1-2", label: "1-2 People" },
      { value: "3-4", label: "3-4 People" },
      { value: "5+", label: "5+ People" },
    ],
    []
  );

  const availabilityOptions = useMemo(
    () => [
      { value: "", label: "All" },
      { value: "available", label: "Available" },
      { value: "unavailable", label: "Unavailable" },
    ],
    []
  );

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading accommodations...</span>
      </div>
    );
  }
  const text = `
  <h2>This is a heading</h2>
  <p>This is a paragraph with <strong>bold text</strong>.</p>
  <ul><li>First bullet</li><li>Second bullet</li></ul>
  `;
  console.log("Sanitized HTML:", DOMPurify.sanitize(text, sanitizeConfig));
  console.log("Raw HTML:", text);
  return (
    <div className="space-y-6 pb-16 md:pb-0">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Accommodations</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your resort's accommodations
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => navigate("/accommodations/new")}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-nature-600 to-nature-700 hover:from-nature-700 hover:to-nature-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nature-500 transition-all duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Accommodation
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
            placeholder="Search accommodations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-nature-500 focus:border-nature-500 sm:text-sm"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <XCircle className="h-5 w-5 text-gray-400 hover:text-gray-500" />
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={() => setFilterOpen(!filterOpen)}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nature-500"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </button>
      </div>

      {/* Filter Panel */}
      {filterOpen && (
        <div className="bg-white p-4 rounded-md shadow space-y-4">
          <h3 className="font-medium text-gray-700">Filter Options</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={filters.type}
                onChange={(e) =>
                  setFilters({ ...filters, type: e.target.value })
                }
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-nature-500 focus:border-nature-500 sm:text-sm"
              >
                {typeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Capacity
              </label>
              <select
                value={filters.capacity}
                onChange={(e) =>
                  setFilters({ ...filters, capacity: e.target.value })
                }
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                {capacityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Availability
              </label>
              <select
                value={filters.availability}
                onChange={(e) =>
                  setFilters({ ...filters, availability: e.target.value })
                }
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                {availabilityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={resetFilters}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nature-500"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={applyFilters}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-nature-600 to-nature-700 hover:from-nature-700 hover:to-nature-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nature-500"
            >
              Apply
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="border-2 border-red-400 bg-red-50 text-red-700 px-4 py-6 rounded-md text-center font-medium">
          {error}
        </div>
      )}

      {/* Accommodations Grid */}
      {!error && (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {accommodations.map((accommodation) => (
            <div
              key={accommodation.id}
              className="bg-white rounded-lg shadow overflow-hidden flex flex-col h-full"
            >
              <div className="relative h-48 flex-shrink-0">
                <img
                  src={
                    accommodation.images[0] ||
                    "https://images.pexels.com/photos/1134176/pexels-photo-1134176.jpeg"
                  }
                  alt={accommodation.name}
                  className="w-full h-full object-cover"
                  onError={handleImageError}
                />
                <div className="absolute top-2 right-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                      accommodation.available
                        ? "bg-green-100 text-green-800 hover:bg-green-200"
                        : "bg-red-100 text-red-800 hover:bg-red-200"
                    }`}
                    onClick={() =>
                      toggleAvailability(
                        accommodation.id,
                        accommodation.available
                      )
                    }
                  >
                    {accommodation.available ? "Available" : "Unavailable"}
                  </span>
                </div>
              </div>
              <div className="p-4 flex flex-col flex-grow">
                <div className="flex items-center mb-2">
                  <Building2 className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
                  <h3 className="text-lg font-medium text-gray-900 truncate">
                    {accommodation.name}
                  </h3>
                </div>
                <p className="text-sm text-gray-500">{accommodation.type}</p>

                {accommodation.description && (
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                    {accommodation.description}
                  </p>
                )}
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-medium">Capacity:</span>{" "}
                    {accommodation.capacity}
                  </div>
                  <div>
                    <span className="font-medium">Rooms:</span>{" "}
                    {accommodation.rooms}
                  </div>
                  <div>
                    <span className="font-medium">Price:</span>{" "}
                    {formatPrice(accommodation.price)}
                  </div>
                  <div>
                    <span className="font-medium">Location:</span>{" "}
                    {accommodation.location.address}
                  </div>
                </div>
                {accommodation.package.description && (
                  <div className="mt-2 text-sm text-gray-600">
                    <span className="font-medium">Package:</span>
                    <article
                      className=" prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(
                          accommodation.package.description,
                          sanitizeConfig
                        ),
                      }}
                    />
                  </div>
                )}
                <div className="mt-auto pt-4 flex space-x-2">
                  <button
                    onClick={() =>
                      navigate(`/accommodations/${accommodation.id}`)
                    }
                    className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(accommodation.id)}
                    className="inline-flex justify-center items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-red-600 bg-white hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() =>
                      navigate(`/accommodations/${accommodation.id}/view`)
                    }
                    className="inline-flex justify-center items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-blue-600 bg-white hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination.total > 0 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-500">
            Showing{" "}
            <span className="font-medium">
              {(pagination.currentPage - 1) * pagination.perPage + 1}
            </span>{" "}
            to{" "}
            <span className="font-medium">
              {Math.min(
                pagination.currentPage * pagination.perPage,
                pagination.total
              )}
            </span>{" "}
            of <span className="font-medium">{pagination.total}</span> results
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => {
                if (pagination.hasPrevPage) {
                  setPagination((prev) => ({
                    ...prev,
                    currentPage: prev.currentPage - 1,
                  }));
                }
              }}
              disabled={!pagination.hasPrevPage}
              className="px-3 py-1 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => {
                if (pagination.hasNextPage) {
                  setPagination((prev) => ({
                    ...prev,
                    currentPage: prev.currentPage + 1,
                  }));
                }
              }}
              disabled={!pagination.hasNextPage}
              className="px-3 py-1 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* No Accommodations */}
      {!loading && !error && accommodations.length === 0 && (
        <div className="text-center py-10">
          <Building2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No accommodations found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ||
            filters.type ||
            filters.capacity ||
            filters.availability
              ? "Try adjusting your search or filter criteria."
              : "Get started by adding your first accommodation."}
          </p>
        </div>
      )}
    </div>
  );
};

export default Accommodations;
