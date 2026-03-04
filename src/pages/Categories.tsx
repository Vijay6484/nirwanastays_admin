import React, { useState, useEffect } from "react";
import { Pencil, XCircle } from "lucide-react";

type Category = {
  id: number;
  name: string; // This will be the accommodation type (e.g., "Cottage")
  image: string; // First image from the images array
  status: "active" | "inactive"; // "active" if available, "inactive" if not
};

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "https://api.nirwanastays.com/admin/properties/accommodations"
        );
        const data = await response.json();
        
        // Transform API data into our category format
        const transformedCategories = data.data.map((acc: any) => ({
          id: acc.id,
          name: acc.type, // Using the accommodation type as name
          image: acc.images[0] || "https://via.placeholder.com/300",
          status: acc.available ? "active" : "inactive"
        }));
        
        setCategories(transformedCategories);
      } catch (error) {
        console.error("Error fetching data:", error);
        // Fallback to default categories if API fails
        setCategories([
          { id: 1, name: "Resort", image: "resort.jpg", status: "active" },
          { id: 2, name: "Hotel", image: "hotel.jpg", status: "active" },
          { id: 3, name: "Camping", image: "camping.jpg", status: "inactive" },
          { id: 4, name: "Villa", image: "villa.jpg", status: "active" },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleEditClick = (category: Category) => {
    setEditCategory(category);
  };

  const handleSaveChanges = () => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === editCategory?.id ? editCategory : cat))
    );
    setEditCategory(null);
  };

  if (loading) {
    return (
      <div className="space-y-6 pb-16">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <p className="text-sm text-gray-500">Loading categories...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
      <p className="text-sm text-gray-500">
        Manage categories for your resort business.
      </p>

      {/* Grid Layout for Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((category) => (
          <div key={category.id} className="bg-white rounded-lg shadow p-4">
            <img
              src={category.image}
              alt={category.name}
              className="h-40 w-full rounded-md object-cover"
            />
            <div className="flex items-center justify-between mt-3">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {category.name}
                </h3>
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    category.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {category.status.charAt(0).toUpperCase() +
                    category.status.slice(1)}
                </span>
              </div>
              <button
                onClick={() => handleEditClick(category)}
                className="text-blue-600 hover:text-blue-800"
              >
                <Pencil className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editCategory && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Edit Category</h2>
              <button
                onClick={() => setEditCategory(null)}
                className="text-red-500 hover:text-red-700"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            <div className="mt-4 space-y-4">
              <label className="block">
                <span className="text-gray-700">Name</span>
                <input
                  type="text"
                  value={editCategory.name}
                  onChange={(e) =>
                    setEditCategory({ ...editCategory, name: e.target.value })
                  }
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm"
                />
              </label>
              <label className="block">
                <span className="text-gray-700">Image</span>
                <input
                  type="text"
                  value={editCategory.image}
                  onChange={(e) =>
                    setEditCategory({ ...editCategory, image: e.target.value })
                  }
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm"
                />
              </label>
              <label className="block">
                <span className="text-gray-700">Status</span>
                <select
                  value={editCategory.status}
                  onChange={(e) =>
                    setEditCategory({
                      ...editCategory,
                      status: e.target.value as "active" | "inactive",
                    })
                  }
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </label>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleSaveChanges}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;