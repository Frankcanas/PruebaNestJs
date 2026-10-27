export type UserRole = 'ADMIN' | 'MANAGER' | 'MECHANIC';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export type VehicleStatus = 'AVAILABLE' | 'IN_MAINTENANCE' | 'INACTIVE';

export interface Vehicle {
  id: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  status: VehicleStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Mechanic {
  id: string;
  specialty: string;
  isActive: boolean;
  userId: string;
  user?: {
    id: string;
    fullName: string;
    email: string;
  };
  createdAt: string;
}

export type WorkshopStatus = 'ACTIVE' | 'INACTIVE';

export interface Workshop {
  id: string;
  name: string;
  address: string;
  phone: string;
  capacity: number;
  status: WorkshopStatus;
  createdAt: string;
}

export type MaintenanceStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface Maintenance {
  id: string;
  vehicleId: string;
  mechanicId: string;
  workshopId: string;
  description: string;
  scheduledDate: string;
  estimatedEndDate: string;
  actualEndDate?: string | null;
  status: MaintenanceStatus;
  totalCost?: number | string | null;
  laborHours?: number | string | null;
  notes?: string | null;
  vehicle?: Vehicle;
  mechanic?: Mechanic;
  workshop?: Workshop;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  data: T;
  timestamp: string;
  path: string;
}
