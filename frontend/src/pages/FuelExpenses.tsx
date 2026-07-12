import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fuelLogApi, expenseApi, vehicleApi } from '../api';
import type { FuelLog, Expense, ExpenseCategory } from '../types';
import Button from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Plus, Pencil, Trash2, Fuel, DollarSign } from 'lucide-react';

const categoryColors: Record<ExpenseCategory, string> = {
  FUEL: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  MAINTENANCE: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  INSURANCE: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  TOLLS: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  PARKING: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  FINE: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  OTHER: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
};

export default function FuelExpenses() {
  const [activeTab, setActiveTab] = useState<'fuel' | 'expenses'>('fuel');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FuelLog | Expense | null>(null);
  const [fuelFormData, setFuelFormData] = useState({
    vehicleId: '',
    date: '',
    fuelAmount: '',
    cost: '',
    mileage: '',
    station: '',
    receiptNumber: '',
  });
  const [expenseFormData, setExpenseFormData] = useState({
    category: 'OTHER' as ExpenseCategory,
    amount: '',
    description: '',
    date: '',
    tripId: '',
    receiptNumber: '',
    notes: '',
  });

  const queryClient = useQueryClient();

  const { data: fuelLogs, isLoading: fuelLoading } = useQuery({
    queryKey: ['fuel-logs'],
    queryFn: () => fuelLogApi.getAll(),
  });

  const { data: expenses, isLoading: expenseLoading } = useQuery({
    queryKey: ['expenses'],
    queryFn: () => expenseApi.getAll(),
  });

  const { data: vehicles } = useQuery({
    queryKey: ['vehicles-list'],
    queryFn: () => vehicleApi.getAll(),
  });

  const createFuelMutation = useMutation({
    mutationFn: fuelLogApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fuel-logs'] });
      setIsModalOpen(false);
      resetFuelForm();
    },
  });

  const updateFuelMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<FuelLog> }) =>
      fuelLogApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fuel-logs'] });
      setIsModalOpen(false);
      setEditingItem(null);
      resetFuelForm();
    },
  });

  const deleteFuelMutation = useMutation({
    mutationFn: fuelLogApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fuel-logs'] });
    },
  });

  const createExpenseMutation = useMutation({
    mutationFn: expenseApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      setIsModalOpen(false);
      resetExpenseForm();
    },
  });

  const updateExpenseMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Expense> }) =>
      expenseApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      setIsModalOpen(false);
      setEditingItem(null);
      resetExpenseForm();
    },
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: expenseApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });

  const resetFuelForm = () => {
    setFuelFormData({
      vehicleId: '',
      date: '',
      fuelAmount: '',
      cost: '',
      mileage: '',
      station: '',
      receiptNumber: '',
    });
  };

  const resetExpenseForm = () => {
    setExpenseFormData({
      category: 'OTHER',
      amount: '',
      description: '',
      date: '',
      tripId: '',
      receiptNumber: '',
      notes: '',
    });
  };

  const handleFuelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...fuelFormData,
      fuelAmount: parseFloat(fuelFormData.fuelAmount),
      cost: parseFloat(fuelFormData.cost),
      mileage: parseFloat(fuelFormData.mileage),
    };
    if (editingItem && 'fuelAmount' in editingItem) {
      updateFuelMutation.mutate({ id: editingItem.id, data: submitData });
    } else {
      createFuelMutation.mutate(submitData);
    }
  };

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...expenseFormData,
      amount: parseFloat(expenseFormData.amount),
    };
    if (editingItem && 'category' in editingItem) {
      updateExpenseMutation.mutate({ id: editingItem.id, data: submitData });
    } else {
      createExpenseMutation.mutate(submitData);
    }
  };

  const handleEditFuel = (log: FuelLog) => {
    setEditingItem(log);
    setFuelFormData({
      vehicleId: log.vehicleId,
      date: log.date.split('T')[0],
      fuelAmount: log.fuelAmount.toString(),
      cost: log.cost.toString(),
      mileage: log.mileage.toString(),
      station: log.station || '',
      receiptNumber: log.receiptNumber || '',
    });
    setIsModalOpen(true);
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingItem(expense);
    setExpenseFormData({
      category: expense.category,
      amount: expense.amount.toString(),
      description: expense.description,
      date: expense.date.split('T')[0],
      tripId: expense.tripId || '',
      receiptNumber: expense.receiptNumber || '',
      notes: expense.notes || '',
    });
    setIsModalOpen(true);
  };

  const totalFuelCost = fuelLogs?.reduce((sum, log) => sum + log.cost, 0) || 0;
  const totalExpenses = expenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Fuel & Expenses</h1>
        <Button onClick={() => {
          if (activeTab === 'fuel') {
            resetFuelForm();
            setEditingItem(null);
          } else {
            resetExpenseForm();
            setEditingItem(null);
          }
          setIsModalOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Add {activeTab === 'fuel' ? 'Fuel Log' : 'Expense'}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <Fuel className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Fuel Cost</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">${totalFuelCost.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                <DollarSign className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Expenses</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">${totalExpenses.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('fuel')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'fuel'
                ? 'border-gray-900 dark:border-white text-gray-900 dark:text-white'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Fuel Logs
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'expenses'
                ? 'border-gray-900 dark:border-white text-gray-900 dark:text-white'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Expenses
          </button>
        </nav>
      </div>

      {/* Fuel Logs Table */}
      {activeTab === 'fuel' && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Vehicle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Fuel (L)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Cost
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Mileage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Station
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {fuelLoading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                        Loading...
                      </td>
                    </tr>
                  ) : fuelLogs?.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                        No fuel logs found
                      </td>
                    </tr>
                  ) : (
                    fuelLogs?.map((log) => (
                      <tr key={log.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {log.vehicle?.registrationNumber || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(log.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {log.fuelAmount} L
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          ${log.cost.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {log.mileage.toLocaleString()} km
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {log.station || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleEditFuel(log)}
                            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mr-3"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteFuelMutation.mutate(log.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expenses Table */}
      {activeTab === 'expenses' && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {expenseLoading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                        Loading...
                      </td>
                    </tr>
                  ) : expenses?.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                        No expenses found
                      </td>
                    </tr>
                  ) : (
                    expenses?.map((expense) => (
                      <tr key={expense.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${categoryColors[expense.category]}`}>
                            {expense.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {expense.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          ${expense.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(expense.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleEditExpense(expense)}
                            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mr-3"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteExpenseMutation.mutate(expense.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={() => setIsModalOpen(false)}>
              <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
            </div>
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              {activeTab === 'fuel' ? (
                <form onSubmit={handleFuelSubmit}>
                  <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      {editingItem ? 'Edit Fuel Log' : 'Add Fuel Log'}
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Vehicle</label>
                        <select
                          required
                          value={fuelFormData.vehicleId}
                          onChange={(e) => setFuelFormData({ ...fuelFormData, vehicleId: e.target.value })}
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
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
                        <input
                          type="date"
                          required
                          value={fuelFormData.date}
                          onChange={(e) => setFuelFormData({ ...fuelFormData, date: e.target.value })}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fuel Amount (L)</label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={fuelFormData.fuelAmount}
                          onChange={(e) => setFuelFormData({ ...fuelFormData, fuelAmount: e.target.value })}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cost ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={fuelFormData.cost}
                          onChange={(e) => setFuelFormData({ ...fuelFormData, cost: e.target.value })}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mileage (km)</label>
                        <input
                          type="number"
                          step="0.1"
                          required
                          value={fuelFormData.mileage}
                          onChange={(e) => setFuelFormData({ ...fuelFormData, mileage: e.target.value })}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Station</label>
                        <input
                          type="text"
                          value={fuelFormData.station}
                          onChange={(e) => setFuelFormData({ ...fuelFormData, station: e.target.value })}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
                    <Button type="submit" disabled={createFuelMutation.isPending || updateFuelMutation.isPending}>
                      {editingItem ? 'Update' : 'Create'}
                    </Button>
                    <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleExpenseSubmit}>
                  <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      {editingItem ? 'Edit Expense' : 'Add Expense'}
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                        <select
                          value={expenseFormData.category}
                          onChange={(e) => setExpenseFormData({ ...expenseFormData, category: e.target.value as ExpenseCategory })}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="FUEL">Fuel</option>
                          <option value="MAINTENANCE">Maintenance</option>
                          <option value="INSURANCE">Insurance</option>
                          <option value="TOLLS">Tolls</option>
                          <option value="PARKING">Parking</option>
                          <option value="FINE">Fine</option>
                          <option value="OTHER">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={expenseFormData.amount}
                          onChange={(e) => setExpenseFormData({ ...expenseFormData, amount: e.target.value })}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                        <input
                          type="text"
                          required
                          value={expenseFormData.description}
                          onChange={(e) => setExpenseFormData({ ...expenseFormData, description: e.target.value })}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
                        <input
                          type="date"
                          required
                          value={expenseFormData.date}
                          onChange={(e) => setExpenseFormData({ ...expenseFormData, date: e.target.value })}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Receipt Number</label>
                        <input
                          type="text"
                          value={expenseFormData.receiptNumber}
                          onChange={(e) => setExpenseFormData({ ...expenseFormData, receiptNumber: e.target.value })}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
                    <Button type="submit" disabled={createExpenseMutation.isPending || updateExpenseMutation.isPending}>
                      {editingItem ? 'Update' : 'Create'}
                    </Button>
                    <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
