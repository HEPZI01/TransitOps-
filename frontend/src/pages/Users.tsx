// @ts-nocheck
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '../api';
import type { User, UserRole } from '../types';
import Button from '../components/ui/Button';
import { CardContent } from '../components/ui/Card';
import { AnimatedCard as Card } from '../components/ui/AnimatedCard';
import { StaggeredTableBody, StaggeredTableRow } from '../components/ui/StaggeredList';
import { Plus, Pencil, Trash2, Search, Shield, ToggleLeft, ToggleRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function Users() {
  const { user: currentUser } = useAuth();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'DISPATCHER' as UserRole,
  });
  const [error, setError] = useState('');

  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: userApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: userApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsModalOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || 'Failed to create user');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> & { password?: string } }) =>
      userApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsModalOpen(false);
      setEditingUser(null);
      resetForm();
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || 'Failed to update user');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: userApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'DISPATCHER',
    });
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (editingUser) {
      const payload: any = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
      };
      if (formData.password) {
        payload.password = formData.password;
      }
      updateMutation.mutate({ id: editingUser.id, data: payload });
    } else {
      if (!formData.password) {
        setError('Password is required for new users');
        return;
      }
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
    });
    setIsModalOpen(true);
  };

  const handleToggleActive = (user: User) => {
    updateMutation.mutate({
      id: user.id,
      data: { isActive: !user.isActive },
    });
  };

  const filteredUsers = users?.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white border-b-2 border-role-primary pb-1 inline-block">User Management</h1>
        <Button onClick={() => { resetForm(); setEditingUser(null); setIsModalOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by name, email, or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 bg-[#16161A] text-white"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center text-gray-500 py-12">Loading users...</div>
        ) : filteredUsers?.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 py-12">No users found</div>
        ) : (
          filteredUsers?.map((u) => (
            <div key={u.id} className="bg-[#16161A] rounded-3xl p-6 border border-white/5 shadow-2xl flex flex-col relative overflow-hidden group hover:border-white/10 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#0B0B0F] border border-white/10 flex items-center justify-center text-xl font-light text-white shadow-inner">
                    {u.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white leading-tight">{u.name} {u.id === currentUser?.id && <span className="text-xs font-normal text-gray-500">(You)</span>}</h3>
                    <p className="text-sm text-gray-400">{u.email}</p>
                  </div>
                </div>
                <button onClick={() => handleEdit(u)} className="text-gray-500 hover:text-white transition-colors bg-[#0B0B0F] p-2 rounded-full border border-white/5 hover:border-white/20 z-10"><Pencil className="w-3 h-3"/></button>
              </div>
              
              <div className="flex-1 flex flex-col justify-end gap-3 mt-4 z-10">
                 <div className="flex items-center justify-between bg-[#0B0B0F] rounded-2xl px-4 py-2 border border-white/5">
                    <span className="text-xs text-gray-500">Role</span>
                    <span className="text-xs font-medium text-white flex items-center gap-1.5"><Shield className="w-3 h-3 text-blue-500"/> {u.role.replace('_', ' ')}</span>
                 </div>
                 <div className="flex items-center justify-between bg-[#0B0B0F] rounded-2xl px-4 py-2 border border-white/5">
                    <span className="text-xs text-gray-500">Status</span>
                    <button onClick={() => handleToggleActive(u)} disabled={u.id === currentUser?.id} className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border ${u.isActive ? 'bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20'}`}>
                      {u.isActive ? 'Active' : 'Deactivated'}
                    </button>
                 </div>
              </div>
              
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-red-500/5 rounded-full blur-2xl group-hover:bg-red-500/10 transition-all cursor-pointer z-0 pointer-events-none"></div>
              
              <button onClick={() => {
                  if (window.confirm(`Are you sure you want to delete ${u.name}?`)) {
                    deleteMutation.mutate(u.id);
                  }
                }} disabled={u.id === currentUser?.id} className="absolute bottom-4 right-4 text-red-500/30 hover:text-red-500 hover:bg-red-500/10 p-2 rounded-full transition-all z-20">
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
            <div className="inline-block align-bottom bg-[#16161A] rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    {editingUser ? 'Edit User' : 'Add User'}
                  </h3>
                  {error && (
                    <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded text-sm">
                      {error}
                    </div>
                  )}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Password {editingUser && '(Leave blank to keep unchanged)'}
                      </label>
                      <input
                        type="password"
                        required={!editingUser}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-white"
                        placeholder={editingUser ? '••••••••' : ''}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Role
                      </label>
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-white"
                      >
                        <option value="ADMIN">Admin</option>
                        <option value="FLEET_MANAGER">Fleet Manager</option>
                        <option value="SAFETY_OFFICER">Safety Officer</option>
                        <option value="DISPATCHER">Dispatcher</option>
                        <option value="FINANCIAL_ANALYST">Financial Analyst</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="bg-[#0B0B0F] px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {editingUser ? 'Save Changes' : 'Create User'}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setIsModalOpen(false)}
                  >
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
