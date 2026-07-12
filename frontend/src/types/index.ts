export type UserRole = 'ADMIN' | 'FLEET_MANAGER' | 'DISPATCHER' | 'SAFETY_OFFICER' | 'FINANCIAL_ANALYST';

export type VehicleStatus = 'AVAILABLE' | 'ON_TRIP' | 'IN_SHOP' | 'RETIRED';
export type VehicleType = 'TRUCK' | 'VAN' | 'BUS' | 'TRAILER' | 'TANKER' | 'FLATBED';
export type DriverStatus = 'AVAILABLE' | 'ON_TRIP' | 'OFF_DUTY' | 'SUSPENDED';
export type TripStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type MaintenanceType = 'ROUTINE' | 'REPAIR' | 'EMERGENCY' | 'INSPECTION';
export type MaintenanceStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type ExpenseCategory = 'FUEL' | 'MAINTENANCE' | 'INSURANCE' | 'TOLLS' | 'PARKING' | 'FINE' | 'OTHER';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt?: string;
}

export interface Vehicle {
  id: string;
  registrationNumber: string;
  make: string;
  model: string;
  year: number;
  type: VehicleType;
  capacity: number;
  fuelType: string;
  status: VehicleStatus;
  currentMileage: number;
  insuranceExpiry?: string;
  lastServiceDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  licenseExpiry: string;
  phone: string;
  email?: string;
  status: DriverStatus;
  experience: number;
  rating: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Trip {
  id: string;
  vehicleId: string;
  driverId: string;
  origin: string;
  destination: string;
  departureDate: string;
  arrivalDate?: string;
  status: TripStatus;
  cargoDescription?: string;
  cargoWeight?: number;
  estimatedDistance?: number;
  actualDistance?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  vehicle?: Vehicle;
  driver?: Driver;
  expenses?: Expense[];
}

export interface MaintenanceLog {
  id: string;
  vehicleId: string;
  type: MaintenanceType;
  description: string;
  cost: number;
  scheduledDate: string;
  completedDate?: string;
  status: MaintenanceStatus;
  mechanicName?: string;
  partsReplaced?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  vehicle?: Vehicle;
}

export interface FuelLog {
  id: string;
  vehicleId: string;
  date: string;
  fuelAmount: number;
  cost: number;
  mileage: number;
  station?: string;
  receiptNumber?: string;
  createdAt: string;
  updatedAt: string;
  vehicle?: Vehicle;
}

export interface Expense {
  id: string;
  tripId?: string;
  category: ExpenseCategory;
  amount: number;
  description: string;
  date: string;
  receiptNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  trip?: Trip;
}

export interface DashboardData {
  vehicles: {
    total: number;
    byStatus: Record<VehicleStatus, number>;
  };
  drivers: {
    total: number;
    byStatus: Record<DriverStatus, number>;
  };
  trips: {
    total: number;
    byStatus: Record<TripStatus, number>;
    recent: Trip[];
  };
  expenses: {
    total: number;
    byCategory: { category: ExpenseCategory; total: number; count: number }[];
  };
  fuel: {
    totalLiters: number;
    totalCost: number;
  };
  maintenance: {
    pendingCount: number;
    pendingCost: number;
  };
}

export interface LoginResponse {
  user: User;
  token: string;
}
