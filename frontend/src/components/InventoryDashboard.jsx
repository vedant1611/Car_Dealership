import { useState, useEffect } from 'react';
import CreateVehicleModal from './CreateVehicleModal';
import { useToast } from '../context/ToastContext';

export default function InventoryDashboard() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addToast } = useToast();

  const fetchVehicles = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      addToast('No authentication token found. Please log in.', 'error');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/vehicles', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch inventory.');
      }

      const data = await response.json();
      setVehicles(data);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleCreateVehicle = async (formData) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('/api/vehicles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create vehicle');
      }
      
      addToast('Vehicle created successfully!', 'success');
      setIsModalOpen(false);
      fetchVehicles(); // Re-fetch the inventory list
    } catch (err) {
      addToast('Failed to create vehicle. Please check the data and try again.', 'error');
    }
  };

  const handleDeleteVehicle = async (id) => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) {
      return;
    }

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/vehicles/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete vehicle');
      }

      addToast('Vehicle deleted successfully!', 'success');
      fetchVehicles();
    } catch (err) {
      addToast('Failed to delete vehicle.', 'error');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading inventory...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-semibold text-gray-900">Vehicle Inventory</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-gray-200 transition-all active:scale-[0.98]"
        >
          Add Vehicle
        </button>
      </div>

      {vehicles.length === 0 && (
        <div className="p-8 text-center text-gray-500 bg-gray-50 border border-gray-200 rounded-xl">
          No vehicles found in inventory.
        </div>
      )}

      {vehicles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map(vehicle => (
            <div key={vehicle.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{vehicle.make} {vehicle.model}</h3>
                  <p className="text-sm text-gray-500">{vehicle.year || vehicle.category}</p>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  ${vehicle.price?.toLocaleString()}
                </span>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                <button
                  onClick={() => handleDeleteVehicle(vehicle.id)}
                  className="text-sm font-medium text-red-600 hover:text-red-800 focus:outline-none transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateVehicleModal 
        isOpen={isModalOpen}
        onSubmit={handleCreateVehicle}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
