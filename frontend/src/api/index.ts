import axios from 'axios';
import type {
  User,
  Vehicle,
  Driver,
  Trip,
  MaintenanceLog,
  FuelLog,
  Expense,
  DashboardData,
  LoginResponse,
} from '../types';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const { data } = await api.post('/auth/login', { email, password });
    return data;
  },
  register: async (email: string, password: string, name: string, role?: string): Promise<LoginResponse> => {
    const { data } = await api.post('/auth/register', { email, password, name, role });
    return data;
  },
  getMe: async (): Promise<User> => {
    const { data } = await api.get('/auth/me');
    return data;
  },
};

// Vehicle API
export const vehicleApi = {
  getAll: async (params?: { status?: string; type?: string; search?: string }): Promise<Vehicle[]> => {
    const { data } = await api.get('/vehicles', { params });
    return data;
  },
  getById: async (id: string): Promise<Vehicle> => {
    const { data } = await api.get(`/vehicles/${id}`);
    return data;
  },
  create: async (vehicle: Partial<Vehicle>): Promise<Vehicle> => {
    const { data } = await api.post('/vehicles', vehicle);
    return data;
  },
  update: async (id: string, vehicle: Partial<Vehicle>): Promise<Vehicle> => {
    const { data } = await api.put(`/vehicles/${id}`, vehicle);
    return data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/vehicles/${id}`);
  },
};

// Driver API
export const driverApi = {
  getAll: async (params?: { status?: string; search?: string }): Promise<Driver[]> => {
    const { data } = await api.get('/drivers', { params });
    return data;
  },
  getById: async (id: string): Promise<Driver> => {
    const { data } = await api.get(`/drivers/${id}`);
    return data;
  },
  create: async (driver: Partial<Driver>): Promise<Driver> => {
    const { data } = await api.post('/drivers', driver);
    return data;
  },
  update: async (id: string, driver: Partial<Driver>): Promise<Driver> => {
    const { data } = await api.put(`/drivers/${id}`, driver);
    return data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/drivers/${id}`);
  },
};

// Trip API
export const tripApi = {
  getAll: async (params?: { status?: string; vehicleId?: string; driverId?: string; search?: string }): Promise<Trip[]> => {
    const { data } = await api.get('/trips', { params });
    return data;
  },
  getById: async (id: string): Promise<Trip> => {
    const { data } = await api.get(`/trips/${id}`);
    return data;
  },
  create: async (trip: Partial<Trip>): Promise<Trip> => {
    const { data } = await api.post('/trips', trip);
    return data;
  },
  update: async (id: string, trip: Partial<Trip>): Promise<Trip> => {
    const { data } = await api.put(`/trips/${id}`, trip);
    return data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/trips/${id}`);
  },
};

// Maintenance API
export const maintenanceApi = {
  getAll: async (params?: { status?: string; vehicleId?: string }): Promise<MaintenanceLog[]> => {
    const { data } = await api.get('/maintenance', { params });
    return data;
  },
  getById: async (id: string): Promise<MaintenanceLog> => {
    const { data } = await api.get(`/maintenance/${id}`);
    return data;
  },
  create: async (log: Partial<MaintenanceLog>): Promise<MaintenanceLog> => {
    const { data } = await api.post('/maintenance', log);
    return data;
  },
  update: async (id: string, log: Partial<MaintenanceLog>): Promise<MaintenanceLog> => {
    const { data } = await api.put(`/maintenance/${id}`, log);
    return data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/maintenance/${id}`);
  },
};

// Fuel Log API
export const fuelLogApi = {
  getAll: async (params?: { vehicleId?: string; startDate?: string; endDate?: string }): Promise<FuelLog[]> => {
    const { data } = await api.get('/fuel-logs', { params });
    return data;
  },
  getById: async (id: string): Promise<FuelLog> => {
    const { data } = await api.get(`/fuel-logs/${id}`);
    return data;
  },
  create: async (log: Partial<FuelLog>): Promise<FuelLog> => {
    const { data } = await api.post('/fuel-logs', log);
    return data;
  },
  update: async (id: string, log: Partial<FuelLog>): Promise<FuelLog> => {
    const { data } = await api.put(`/fuel-logs/${id}`, log);
    return data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/fuel-logs/${id}`);
  },
};

// Expense API
export const expenseApi = {
  getAll: async (params?: { category?: string; tripId?: string; startDate?: string; endDate?: string }): Promise<Expense[]> => {
    const { data } = await api.get('/expenses', { params });
    return data;
  },
  getById: async (id: string): Promise<Expense> => {
    const { data } = await api.get(`/expenses/${id}`);
    return data;
  },
  create: async (expense: Partial<Expense>): Promise<Expense> => {
    const { data } = await api.post('/expenses', expense);
    return data;
  },
  update: async (id: string, expense: Partial<Expense>): Promise<Expense> => {
    const { data } = await api.put(`/expenses/${id}`, expense);
    return data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/expenses/${id}`);
  },
};

// Reports API
export const reportApi = {
  getDashboard: async (): Promise<DashboardData> => {
    const { data } = await api.get('/reports/dashboard');
    return data;
  },
  getFleetUtilization: async (): Promise<any[]> => {
    const { data } = await api.get('/reports/fleet-utilization');
    return data;
  },
  getCostAnalysis: async (params?: { startDate?: string; endDate?: string }): Promise<any> => {
    const { data } = await api.get('/reports/cost-analysis', { params });
    return data;
  },
  getDriverPerformance: async (): Promise<any[]> => {
    const { data } = await api.get('/reports/driver-performance');
    return data;
  },
};

// User API
export const userApi = {
  getAll: async (): Promise<User[]> => {
    const { data } = await api.get('/users');
    return data;
  },
  create: async (user: Partial<User> & { password?: string }): Promise<User> => {
    const { data } = await api.post('/users', user);
    return data;
  },
  update: async (id: string, user: Partial<User> & { password?: string }): Promise<User> => {
    const { data } = await api.put(`/users/${id}`, user);
    return data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
};

export default api;
