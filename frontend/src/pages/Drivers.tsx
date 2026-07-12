// @ts-nocheck
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { driverApi } from '../api';
import type { Driver, DriverStatus } from '../types';
import Button from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';

const statusColors: Record<DriverStatus, string> = {
  AVAILABLE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  ON_TRIP: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  OFF_DUTY: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  SUSPENDED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

export default function Drivers() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    licenseNumber: '',
    licenseExpiry: '',
    phone: '',
    email: '',
    experience: 0,
  });

  const queryClient = useQueryClient();

  const { data: drivers, isLoading } = useQuery({
    queryKey: ['drivers', search, statusFilter],
    queryFn: () => driverApi.getAll({ search, status: statusFilter }),
  });

  const createMutation = useMutation({
    mutationFn: driverApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      setIsModalOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Driver> }) =>
      driverApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      setIsModalOpen(false);
      setEditingDriver(null);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: driverApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      licenseNumber: '',
      licenseExpiry: '',
      phone: '',
      email: '',
      experience: 0,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDriver) {
      updateMutation.mutate({ id: editingDriver.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (driver: Driver) => {
    setEditingDriver(driver);
    setFormData({
      name: driver.name,
      licenseNumber: driver.licenseNumber,
      licenseExpiry: driver.licenseExpiry.split('T')[0],
      phone: driver.phone,
      email: driver.email || '',
      experience: driver.experience,
    });
    setIsModalOpen(true);
  };

  const isLicenseExpired = (expiry: string) => new Date(expiry) < new Date();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Drivers</h1>
        <Button onClick={() => { resetForm(); setEditingDriver(null); setIsModalOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Driver
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
                placeholder="Search drivers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="">All Status</option>
              <option value="AVAILABLE">Available</option>
              <option value="ON_TRIP">On Trip</option>
              <option value="OFF_DUTY">Off Duty</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Drivers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center text-gray-500 py-12">Loading drivers...</div>
        ) : drivers?.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 py-12">No drivers found</div>
        ) : (
          drivers?.map((driver) => (
            <div key={driver.id} className="bg-[#16161A] rounded-3xl p-6 border border-white/5 shadow-2xl flex flex-col relative overflow-hidden group hover:border-white/10 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#0B0B0F] border border-white/10 flex items-center justify-center text-xl font-light text-white shadow-inner">
                    {driver.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white leading-tight">{driver.name}</h3>
                    <p className="text-sm text-gray-400">License: {driver.licenseNumber}</p>
                  </div>
                </div>
                <button onClick={() => handleEdit(driver)} className="text-gray-500 hover:text-white transition-colors bg-[#0B0B0F] p-2 rounded-full border border-white/5 hover:border-white/20 z-10"><Pencil className="w-3 h-3"/></button>
              </div>
              
              <div className="flex-1 flex flex-col justify-end gap-3 mt-4 z-10">
                 <div className="flex items-center justify-between bg-[#0B0B0F] rounded-2xl px-4 py-2 border border-white/5">
                    <span className="text-xs text-gray-500">Contact</span>
                    <span className="text-xs font-medium text-white">{driver.phone}</span>
                 </div>
                 <div className="flex items-center justify-between bg-[#0B0B0F] rounded-2xl px-4 py-2 border border-white/5">
                    <span className="text-xs text-gray-500">Status</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border text-center ${driver.status === 'AVAILABLE' ? 'bg-green-500/10 text-green-500 border-green-500/20' : driver.status === 'ON_TRIP' ? 'bg-[#FFD60A]/10 text-[#FFD60A] border-[#FFD60A]/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                      {driver.status.replace('_', ' ')}
                    </span>
                 </div>
              </div>
              
              <button onClick={() => deleteMutation.mutate(driver.id)} className="absolute bottom-4 right-4 text-red-500/30 hover:text-red-500 hover:bg-red-500/10 p-2 rounded-full transition-all z-20">
                <Trash2 className="w-4 h-4" />
              </button>
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
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    {editingDriver ? 'Edit Driver' : 'Add Driver'}
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">License Number</label>
                      <input
                        type="text"
                        required
                        value={formData.licenseNumber}
                        onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">License Expiry</label>
                      <input
                        type="date"
                        required
                        value={formData.licenseExpiry}
                        onChange={(e) => setFormData({ ...formData, licenseExpiry: e.target.value })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Experience (years)</label>
                      <input
                        type="number"
                        required
                        value={formData.experience}
                        onChange={(e) => setFormData({ ...formData, experience: parseInt(e.target.value) })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {editingDriver ? 'Update' : 'Create'}
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
