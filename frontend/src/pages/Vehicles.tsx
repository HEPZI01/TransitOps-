// @ts-nocheck
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vehicleApi } from '../api';
import type { Vehicle, VehicleStatus, VehicleType } from '../types';
import Button from '../components/ui/Button';
import { CardContent } from '../components/ui/Card';
import { AnimatedCard as Card } from '../components/ui/AnimatedCard';
import { StaggeredTableBody, StaggeredTableRow } from '../components/ui/StaggeredList';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';

const statusColors: Record<VehicleStatus, string> = {
  AVAILABLE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  ON_TRIP: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  IN_SHOP: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  RETIRED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

export default function Vehicles() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [formData, setFormData] = useState({
    registrationNumber: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    type: 'TRUCK' as VehicleType,
    capacity: 0,
    fuelType: 'Diesel',
    insuranceExpiry: '',
  });

  const queryClient = useQueryClient();

  const { data: vehicles, isLoading } = useQuery({
    queryKey: ['vehicles', search, statusFilter],
    queryFn: () => vehicleApi.getAll({ search, status: statusFilter }),
  });

  const createMutation = useMutation({
    mutationFn: vehicleApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      setIsModalOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Vehicle> }) =>
      vehicleApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      setIsModalOpen(false);
      setEditingVehicle(null);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: vehicleApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });

  const resetForm = () => {
    setFormData({
      registrationNumber: '',
      make: '',
      model: '',
      year: new Date().getFullYear(),
      type: 'TRUCK',
      capacity: 0,
      fuelType: 'Diesel',
      insuranceExpiry: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingVehicle) {
      updateMutation.mutate({ id: editingVehicle.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      registrationNumber: vehicle.registrationNumber,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      type: vehicle.type,
      capacity: vehicle.capacity,
      fuelType: vehicle.fuelType,
      insuranceExpiry: vehicle.insuranceExpiry?.split('T')[0] || '',
    });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white border-b-2 border-role-primary pb-1 inline-block">Vehicles</h1>
        <Button onClick={() => { resetForm(); setEditingVehicle(null); setIsModalOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Vehicle
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search vehicles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 bg-[#16161A] text-white"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 bg-[#16161A] text-white"
            >
              <option value="">All Status</option>
              <option value="AVAILABLE">Available</option>
              <option value="ON_TRIP">On Trip</option>
              <option value="IN_SHOP">In Shop</option>
              <option value="RETIRED">Retired</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Vehicles Roster */}
      <div className="flex flex-col gap-4">
        {isLoading ? (
          <div className="text-center text-gray-500 py-12">Loading vehicles...</div>
        ) : vehicles?.length === 0 ? (
          <div className="text-center text-gray-500 py-12">No vehicles found</div>
        ) : (
          vehicles?.map((vehicle) => (
            <div key={vehicle.id} className="bg-[#16161A] rounded-2xl p-5 border border-white/5 shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group hover:border-white/10 transition-all relative overflow-hidden">
              
              <div className="flex items-center gap-6 pl-4">
                 <div className="bg-[#0B0B0F] border border-white/10 rounded-xl p-3 flex flex-col items-center justify-center min-w-[100px] shadow-inner">
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Plate</span>
                    <span className="text-lg font-bold text-white tracking-wider">{vehicle.registrationNumber}</span>
                 </div>
                 
                 <div>
                    <h3 className="text-xl font-bold text-white">{vehicle.year} {vehicle.make} {vehicle.model}</h3>
                    <div className="flex gap-4 mt-2">
                       <span className="text-xs text-gray-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span> Type: {vehicle.type}</span>
                       <span className="text-xs text-gray-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span> Cap: {vehicle.capacity}t</span>
                       <span className="text-xs text-gray-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span> {vehicle.currentMileage.toLocaleString()} km</span>
                    </div>
                 </div>
              </div>
              
              <div className="flex items-center gap-8 bg-[#0B0B0F] py-2 px-6 rounded-2xl border border-white/5 w-full md:w-auto justify-between md:justify-end">
                 <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Status</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border text-center ${vehicle.status === 'AVAILABLE' ? 'bg-green-500/10 text-green-500 border-green-500/20' : vehicle.status === 'IN_SHOP' ? 'bg-[#FFD60A]/10 text-[#FFD60A] border-[#FFD60A]/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                       {vehicle.status.replace('_', ' ')}
                    </span>
                 </div>
                 
                 <div className="flex flex-col min-w-[120px]">
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Assigned To</span>
                    {(() => {
                          const activeTrip = vehicle.trips?.find(t => t.status === 'IN_PROGRESS' || t.status === 'PENDING');
                          const activeDriverName = activeTrip?.driver?.name;
                          const otherDrivers = vehicle.trips
                            ? Array.from(new Set(vehicle.trips.map(t => t.driver?.name).filter(name => name && name !== activeDriverName)))
                            : [];

                          return (
                            <div className="flex flex-col">
                              {activeDriverName && (
                                <span className="text-xs font-bold text-white flex items-center">
                                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse shadow-[0_0_5px_rgba(16,185,129,0.8)]"></span>
                                  {activeDriverName}
                                </span>
                              )}
                              {otherDrivers.length > 0 && (
                                <span className="text-[10px] text-gray-500">
                                  Prev: {otherDrivers.slice(0, 1).join(', ')}
                                  {otherDrivers.length > 1 ? '...' : ''}
                                </span>
                              )}
                              {!activeDriverName && otherDrivers.length === 0 && (
                                <span className="text-gray-600 italic text-xs">Unassigned</span>
                              )}
                            </div>
                          );
                    })()}
                 </div>
                 
                 <div className="flex gap-2">
                    <button onClick={() => handleEdit(vehicle)} className="text-gray-500 hover:text-white transition-colors bg-[#16161A] p-2 rounded-full border border-white/5 hover:border-white/20"><Pencil className="w-4 h-4"/></button>
                    <button onClick={() => deleteMutation.mutate(vehicle.id)} className="text-red-500/50 hover:text-red-500 transition-colors bg-[#16161A] p-2 rounded-full border border-white/5 hover:border-red-500/20"><Trash2 className="w-4 h-4"/></button>
                 </div>
              </div>
              
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={() => setIsModalOpen(false)}>
              <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
            </div>
            <div className="inline-block align-bottom bg-[#16161A] rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    {editingVehicle ? 'Edit Vehicle' : 'Add Vehicle'}
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Registration Number
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.registrationNumber}
                        onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white dark:bg-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Make</label>
                      <input
                        type="text"
                        required
                        value={formData.make}
                        onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white dark:bg-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Model</label>
                      <input
                        type="text"
                        required
                        value={formData.model}
                        onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white dark:bg-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Year</label>
                      <input
                        type="number"
                        required
                        value={formData.year}
                        onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white dark:bg-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as VehicleType })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white dark:bg-gray-700 text-white"
                      >
                        <option value="TRUCK">Truck</option>
                        <option value="VAN">Van</option>
                        <option value="BUS">Bus</option>
                        <option value="TRAILER">Trailer</option>
                        <option value="TANKER">Tanker</option>
                        <option value="FLATBED">Flatbed</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Capacity (tons)</label>
                      <input
                        type="number"
                        step="0.1"
                        required
                        value={formData.capacity}
                        onChange={(e) => setFormData({ ...formData, capacity: parseFloat(e.target.value) })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white dark:bg-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fuel Type</label>
                      <input
                        type="text"
                        required
                        value={formData.fuelType}
                        onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white dark:bg-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Insurance Expiry</label>
                      <input
                        type="date"
                        value={formData.insuranceExpiry}
                        onChange={(e) => setFormData({ ...formData, insuranceExpiry: e.target.value })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white dark:bg-gray-700 text-white"
                      />
                    </div>
                  </div>
                </div>
                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {editingVehicle ? 'Update' : 'Create'}
                  </Button>
                  <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
