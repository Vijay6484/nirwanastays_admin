import React, { useState, useEffect } from 'react';
import { Wifi, Music, UtensilsCrossed, Flame, Coffee, Plus, Trash2, Edit, Snowflake, ThermometerSun, ParkingCircle, TreePine, Flower2, CupSoda, Waves } from 'lucide-react';
interface Amenity {
  id: number;
  name: string;
  icon: string;
  active: boolean;
}

const API_BASE_URL = 'https://api.nirwanastays.com/admin/amenities';

const Amenities = () => {
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAmenity, setNewAmenity] = useState({ name: '', icon: 'wifi' });
  const [editAmenity, setEditAmenity] = useState<Amenity | null>(null);

  useEffect(() => {
    fetchAmenities();
  }, []);

  const fetchAmenities = async () => {
    const res = await fetch(API_BASE_URL);
    const data = await res.json();
    setAmenities(data);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this amenity?')) {
      await fetch(`${API_BASE_URL}/${id}`, { method: 'DELETE' });
      setAmenities(amenities.filter(a => a.id !== id));
    }
  };

  const handleAdd = async () => {
    if (newAmenity.name.trim()) {
      const res = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newAmenity, active: 1 })
      });
      const added = await res.json();
      setAmenities([added, ...amenities]);
      setNewAmenity({ name: '', icon: 'wifi' });
      setShowAddModal(false);
    }
  };

  const handleEdit = async () => {
    if (editAmenity && editAmenity.name.trim()) {
      const res = await fetch(`${API_BASE_URL}/${editAmenity.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editAmenity),
      });
      if (res.ok) {
        setAmenities(amenities.map(a => (a.id === editAmenity.id ? editAmenity : a)));
        setEditAmenity(null);
      }
    }
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'wifi':
        return <Wifi className="h-5 w-5" />;
    //   case 'u':
    //     return <Water className="h-5 w-5" />;
      case 'music':
        return <Music className="h-5 w-5" />;  
      case 'pool':
        return <Waves className="h-5 w-5" />;
      case 'coffee':
        return <Coffee className="h-5 w-5" />;
      case 'electric_kettle':
        return <ThermometerSun className="h-5 w-5" />;
      case 'ac':
        return <Snowflake className="h-5 w-5" />;
      case 'restaurant':
        return <UtensilsCrossed className="h-5 w-5" />;
      case 'parking':
        return <ParkingCircle className="h-5 w-5" />;
      case 'mini_fridge':
        return <CupSoda className="h-5 w-5" />;
      case 'spa':
        return <Flower2 className="h-5 w-5" />;
      case 'garden':
        return <TreePine className="h-5 w-5" />;
      case 'barbeque':
        return <Flame className="h-5 w-5" />;
      case 'heater':
        return <ThermometerSun className="h-5 w-5" />;
      default:
        return <Wifi className="h-5 w-5" />;
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Amenities</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Amenity</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Icon
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {amenities.map((amenity) => (
              <tr key={amenity.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-gray-500">
                    {getIcon(amenity.icon)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{amenity.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    amenity.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {amenity.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button
                      className="text-blue-600 hover:text-blue-900"
                      onClick={() => setEditAmenity(amenity)}
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(amenity.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Amenity Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Amenity</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      value={newAmenity.name}
                      onChange={(e) => setNewAmenity({ ...newAmenity, name: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Icon</label>
                    <select
                      value={newAmenity.icon}
                      onChange={(e) => setNewAmenity({ ...newAmenity, icon: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="wifi">WiFi</option>
                      <option value="pool">Swimming Pool</option>
                      <option value="music">Music System</option>
                      <option value="utensils">Dinner</option>
                      <option value="restaurant">Restaurant</option>
                      <option value="flame">Bonfire</option>
                      <option value="coffee">BBQ</option>
                      <option value="electric_kettle">Electric Kettle</option>
                      <option value="ac">AC</option>
                      <option value="barbeque">Barbeque</option>
                      <option value="heater">Heater</option>
                      <option value="parking">Parking</option>
                      <option value="mini_fridge">Mini Fridge</option>
                      <option value="spa">Spa & Wellness</option>
                      <option value="garden">Garden</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleAdd}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Add Amenity
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Amenity Modal */}
      {editAmenity && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Amenity</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      value={editAmenity.name}
                      onChange={(e) => setEditAmenity({ ...editAmenity, name: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Icon</label>
                    <select
                      value={editAmenity.icon}
                      onChange={(e) => setEditAmenity({ ...editAmenity, icon: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="wifi">WiFi</option>
                      <option value="pool">Swimming Pool</option>
                      <option value="music">Music System</option>
                      <option value="utensils">Dinner</option>
                      <option value="restaurant">Restaurant</option>
                      <option value="flame">Bonfire</option>
                      <option value="coffee">BBQ</option>
                      <option value="electric_kettle">Electric Kettle</option>
                      <option value="ac">AC</option>
                      <option value="barbeque">Barbeque</option>
                      <option value="heater">Heater</option>
                      <option value="parking">Parking</option>
                      <option value="mini_fridge">Mini Fridge</option>
                      <option value="spa">Spa & Wellness</option>
                      <option value="garden">Garden</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                      value={editAmenity.active ? 1 : 0}
                      onChange={(e) => setEditAmenity({ ...editAmenity, active: Number(e.target.value) === 1 })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value={1}>Active</option>
                      <option value={0}>Inactive</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleEdit}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditAmenity(null)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
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

export default Amenities;
