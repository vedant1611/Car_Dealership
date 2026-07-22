import { useState, useEffect, useMemo } from 'react';
import CreateVehicleModal from './CreateVehicleModal';
import EditVehicleModal from './EditVehicleModal';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export default function InventoryDashboard() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const { addToast } = useToast();
  const { user, token } = useAuth();

  const fetchVehicles = async () => {
    if (!token) {
      addToast('No authentication token found. Please log in.', 'error');
      setLoading(false);
      return;
    }

    try {
      const params = new URLSearchParams();
      if (minPrice) params.append('min_price', minPrice);
      if (maxPrice) params.append('max_price', maxPrice);
      
      const url = `/api/vehicles${params.toString() ? `?${params.toString()}` : ''}`;
      
      const response = await fetch(url, {
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
  }, [token]);

  const handleCreateVehicle = async (formData) => {
    try {
      const payload = {
        make: formData.make,
        model: formData.model,
        category: formData.year ? formData.year.toString() : 'Unknown',
        price: parseFloat(formData.price) || 0,
        quantity: 1
      };

      const response = await fetch('/api/vehicles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
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

  const handlePurchase = async (id) => {
    try {
      const response = await fetch(`/api/vehicles/${id}/purchase`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Failed to purchase vehicle');
      }

      addToast('Vehicle purchased successfully!', 'success');
      fetchVehicles();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleRestock = async (id) => {
    const qtyStr = window.prompt('Enter quantity to restock:');
    if (!qtyStr) return;
    
    const quantity = parseInt(qtyStr, 10);
    if (isNaN(quantity) || quantity <= 0) {
      addToast('Please enter a valid quantity greater than 0', 'error');
      return;
    }

    try {
      const response = await fetch(`/api/vehicles/${id}/restock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ quantity })
      });

      if (!response.ok) {
        throw new Error('Failed to restock vehicle');
      }

      addToast('Vehicle restocked successfully!', 'success');
      fetchVehicles();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => {
      const matchesSearch = v.make.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            v.model.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory ? v.category === filterCategory : true;
      return matchesSearch && matchesCategory;
    });
  }, [vehicles, searchTerm, filterCategory]);

  const uniqueCategories = useMemo(() => {
    const categories = new Set(vehicles.map(v => v.category).filter(Boolean));
    return Array.from(categories);
  }, [vehicles]);

  if (loading) {
    return <div className="p-8 flex justify-center items-center h-64"><div className="animate-pulse flex space-x-2"><div className="w-3 h-3 bg-gray-400 rounded-full"></div><div className="w-3 h-3 bg-gray-400 rounded-full"></div><div className="w-3 h-3 bg-gray-400 rounded-full"></div></div></div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Vehicle Inventory</h2>
          <p className="text-sm text-gray-500 mt-1">Manage and browse your dealership inventory</p>
        </div>
        {user?.is_admin && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-xl hover:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-gray-900/20 transition-all shadow-lg shadow-gray-900/20 active:scale-[0.98]"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Add Vehicle
          </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex-grow relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input 
            type="text" 
            placeholder="Search make or model..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900 transition-all text-sm"
          />
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <input
            type="number"
            placeholder="Min Price"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full md:w-28 px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900 transition-all text-sm"
          />
          <input
            type="number"
            placeholder="Max Price"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full md:w-28 px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900 transition-all text-sm"
          />
          <button
            onClick={fetchVehicles}
            className="px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-all"
          >
            Apply
          </button>
        </div>

        <div className="w-full md:w-48 flex-shrink-0">
          <select 
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900 transition-all text-sm appearance-none"
          >
            <option value="">All Categories</option>
            {uniqueCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {filteredVehicles.length === 0 ? (
        <div className="p-12 flex flex-col items-center justify-center text-center bg-white border border-gray-100 rounded-3xl shadow-sm">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No vehicles found</h3>
          <p className="text-sm text-gray-500 max-w-sm">We couldn't find any vehicles matching your search criteria. Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredVehicles.map(vehicle => (
            <div key={vehicle.id} className="group flex flex-col bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 overflow-hidden">
              <div className="p-6 flex-grow">
                <div className="flex justify-between items-start mb-4">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                    {vehicle.category || 'Standard'}
                  </span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-bold ${vehicle.quantity > 0 ? 'bg-green-50 text-green-700 ring-1 ring-green-600/20' : 'bg-red-50 text-red-700 ring-1 ring-red-600/20'}`}>
                    {vehicle.quantity > 0 ? `${vehicle.quantity} In Stock` : 'Out of Stock'}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-1 line-clamp-1">{vehicle.make} {vehicle.model}</h3>
                <div className="text-2xl font-black text-gray-900 mb-4 tracking-tight">
                  ${vehicle.price?.toLocaleString()}
                </div>
                
              </div>
              
              <div className="p-4 bg-gray-50/50 border-t border-gray-100 flex flex-wrap gap-2 justify-between items-center">
                <button
                  onClick={() => handlePurchase(vehicle.id)}
                  disabled={vehicle.quantity === 0}
                  className="flex-grow inline-flex justify-center items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-600/20 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-all shadow-sm active:scale-[0.98]"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                  Purchase
                </button>
                
                {user?.is_admin && (
                  <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0 flex-wrap">
                    <button
                      onClick={() => handleRestock(vehicle.id)}
                      className="flex-1 sm:flex-none inline-flex justify-center items-center px-3 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 hover:text-emerald-900 focus:outline-none focus:ring-4 focus:ring-emerald-100 transition-all shadow-sm"
                    >
                      Restock
                    </button>
                    <button
                      onClick={() => {
                        setSelectedVehicle(vehicle);
                        setIsEditModalOpen(true);
                      }}
                      className="flex-1 sm:flex-none inline-flex justify-center items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-100 transition-all shadow-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteVehicle(vehicle.id)}
                      className="flex-1 sm:flex-none inline-flex justify-center items-center px-3 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 focus:outline-none focus:ring-4 focus:ring-red-100 transition-all shadow-sm"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {user?.is_admin && (
        <>
          <CreateVehicleModal 
            isOpen={isModalOpen}
            onSubmit={handleCreateVehicle}
            onClose={() => setIsModalOpen(false)}
          />
          
          <EditVehicleModal 
            isOpen={isEditModalOpen}
            vehicle={selectedVehicle}
            onSuccess={fetchVehicles}
            onClose={() => setIsEditModalOpen(false)}
          />
        </>
      )}
    </div>
  );
}
