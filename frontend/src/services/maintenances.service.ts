import { apiRequest } from './api';
import type { Maintenance } from '../types';

export interface CreateMaintenanceDto {
  vehicleId: string;
  mechanicId: string;
  workshopId: string;
  description: string;
  scheduledDate: string;
  estimatedEndDate: string;
}

export interface CompleteMaintenanceDto {
  totalCost: number;
  laborHours: number;
  notes?: string;
}

export const maintenancesService = {
  async getAll(): Promise<Maintenance[]> {
    return apiRequest<Maintenance[]>('/maintenances');
  },

  async getActive(): Promise<Maintenance[]> {
    return apiRequest<Maintenance[]>('/maintenances/active');
  },

  async getMyAssigned(): Promise<Maintenance[]> {
    return apiRequest<Maintenance[]>('/maintenances/my-assigned');
  },

  async getById(id: string): Promise<Maintenance> {
    return apiRequest<Maintenance>(`/maintenances/${id}`);
  },

  async create(data: CreateMaintenanceDto): Promise<Maintenance> {
    return apiRequest<Maintenance>('/maintenances', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async start(id: string): Promise<Maintenance> {
    return apiRequest<Maintenance>(`/maintenances/${id}/start`, {
      method: 'PATCH',
    });
  },

  async complete(id: string, data: CompleteMaintenanceDto): Promise<Maintenance> {
    return apiRequest<Maintenance>(`/maintenances/${id}/complete`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async cancel(id: string, reason?: string): Promise<Maintenance> {
    return apiRequest<Maintenance>(`/maintenances/${id}/cancel`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    });
  },
};
