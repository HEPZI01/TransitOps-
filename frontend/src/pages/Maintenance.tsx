// @ts-nocheck
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { maintenanceApi, vehicleApi } from '../api';
import type { MaintenanceLog, MaintenanceStatus, MaintenanceType } from '../types';
import Button from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Plus, Pencil, Trash2, CheckCircle, Wrench } from 'lucide-react';

const statusColors: Record<MaintenanceStatus, string> = {
  SCHEDULED: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  IN_PROGRESS: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

const typeColors: Record<MaintenanceType, string> = {
  ROUTINE: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  REPAIR: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  EMERGENCY: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  INSPECTION: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
};

export default function Maintenance() {
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<MaintenanceLog | null>(null);
  const [formData, setFormData] = useState({
    vehicleId: '',
    type: 'ROUTINE' as MaintenanceType,
    description: '',
    cost: '',
    scheduledDate: '',
    mechanicName: '',
    partsReplaced: '',
    notes: '',
  });

  const queryClient = useQueryClient();

  const { data: logs, isLoading } = useQuery({
    queryKey: ['maintenance', statusFilter],
    queryFn: () => maintenanceApi.getAll({ status: statusFilter }),
  });

  const { data: vehicles } = useQuery({
    queryKey: ['vehicles-list'],
    queryFn: () => vehicleApi.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: maintenanceApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      setIsModalOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<MaintenanceLog> }) =>
      maintenanceApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      setIsModalOpen(false);
      setEditingLog(null);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: maintenanceApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
    },
  });

  const resetForm = () => {
    setFormData({
      vehicleId: '',
      type: 'ROUTINE',
      description: '',
      cost: '',
      scheduledDate: '',
      mechanicName: '',
      partsReplaced: '',
      notes: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      cost: parseFloat(formData.cost),
    };
    if (editingLog) {
      updateMutation.mutate({ id: editingLog.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleEdit = (log: MaintenanceLog) => {
    setEditingLog(log);
    setFormData({
      vehicleId: log.vehicleId,
      type: log.type,
      description: log.description,
      cost: log.cost.toString(),
      scheduledDate: log.scheduledDate.split('T')[0],
      mechanicName: log.mechanicName || '',
      partsReplaced: log.partsReplaced || '',
      notes: log.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleComplete = (log: MaintenanceLog) => {
    updateMutation.mutate({
      id: log.id,
      data: {
        status: 'COMPLETED',
        completedDate: new Date().toISOString(),
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Maintenance</h1>
        <Button onClick={() => { resetForm(); setEditingLog(null); setIsModalOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Maintenance Log
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="">All Status</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Maintenance Feed */}
      <div className="flex flex-col gap-4">
        {isLoading ? (
          <div className="text-center text-gray-500 py-12">Loading records...</div>
        ) : logs?.length === 0 ? (
          <div className="text-center text-gray-500 py-12">No records found</div>
        ) : (
          logs?.map((record) => (
             <div key={record.id} className="bg-[#16161A] p-5 rounded-2xl border border-white/5 shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group hover:border-white/10 transition-all relative overflow-hidden">
                
                <div className="flex gap-4 items-center w-full md:w-auto">
                   <div className="w-10 h-10 rounded-full bg-[#0B0B0F] border border-white/10 flex items-center justify-center text-white shrink-0"><Wrench className="w-4 h-4"/></div>
                   <div>
                      <h3 className="font-bold text-white text-lg">{record.description}</h3>
                      <p className="text-sm text-gray-400">Vehicle: {record.vehicle?.registrationNumber || 'Unknown'} | Date: {new Date(record.date).toLocaleDateString()}</p>
                   </div>
                </div>
                
                <div className="flex items-center gap-6 w-full md:w-auto bg-[#0B0B0F] px-6 py-3 rounded-2xl border border-white/5 justify-between md:justify-end">
                   <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-widest text-gray-500">Cost</span>
                      <span className="font-bold text-white">${record.cost.toFixed(2)}</span>
                   </div>
                   
                   <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-widest text-gray-500">Type</span>
                      <span className="text-xs font-bold text-gray-400">{record.type}</span>
                   </div>
                   
                   <div className="flex flex-col min-w-[100px] items-end">
                      <span className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Status</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border text-center ${record.status === 'COMPLETED' ? 'bg-green-500/10 text-green-500 border-green-500/20' : record.status === 'SCHEDULED' ? 'bg-[#FFD60A]/10 text-[#FFD60A] border-[#FFD60A]/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'}`}>
                         {record.status.replace('_', ' ')}
                      </span>
                   </div>
                   
                   <div className="flex gap-2 ml-4">
                     {record.status !== 'COMPLETED' && (
                       <button onClick={() => handleComplete(record)} className="p-2 rounded-full bg-green-500/10 hover:bg-green-500/20 text-green-500"><CheckCircle className="w-4 h-4"/></button>
                     )}
                     <button onClick={() => handleEdit(record)} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400"><Pencil className="w-4 h-4"/></button>
                     <button onClick={() => deleteMutation.mutate(record.id)} className="p-2 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-500"><Trash2 className="w-4 h-4"/></button>
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
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    {editingLog ? 'Edit Maintenance Log' : 'Add Maintenance Log'}
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Vehicle</label>
                      <select
                        required
                        value={formData.vehicleId}
                        onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="">Select Vehicle</option>
                        {vehicles?.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.registrationNumber} - {v.make} {v.model}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as MaintenanceType })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="ROUTINE">Routine</option>
                        <option value="REPAIR">Repair</option>
                        <option value="EMERGENCY">Emergency</option>
                        <option value="INSPECTION">Inspection</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cost ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={formData.cost}
                        onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Scheduled Date</label>
                      <input
                        type="date"
                        required
                        value={formData.scheduledDate}
                        onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mechanic Name</label>
                      <input
                        type="text"
                        value={formData.mechanicName}
                        onChange={(e) => setFormData({ ...formData, mechanicName: e.target.value })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                      <textarea
                        required
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Parts Replaced</label>
                      <input
                        type="text"
                        value={formData.partsReplaced}
                        onChange={(e) => setFormData({ ...formData, partsReplaced: e.target.value })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notes</label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        rows={2}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {editingLog ? 'Update' : 'Create'}
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
