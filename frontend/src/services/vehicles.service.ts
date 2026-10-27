import { apiRequest } from './api';
import type { Vehicle, Maintenance } from '../types';

export const vehiclesService = {
  async getAll(): Promise<Vehicle[]> {
    return apiRequest<Vehicle[]>('/vehicles');
  },

  async getById(id: string): Promise<Vehicle> {
    return apiRequest<Vehicle>(`/vehicles/${id}`);
  },

  async create(data: { plate: string; brand: string; model: string; year: number }): Promise<Vehicle> {
    return apiRequest<Vehicle>('/vehicles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: Partial<Pick<Vehicle, 'brand' | 'model' | 'year' | 'status'>>): Promise<Vehicle> {
    return apiRequest<Vehicle>(`/vehicles/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string): Promise<Vehicle> {
    return apiRequest<Vehicle>(`/vehicles/${id}`, {
      method: 'DELETE',
    });
  },

  async getHistory(id: string): Promise<Maintenance[]> {
    return apiRequest<Maintenance[]>(`/vehicles/${id}/history`);
  },
};
