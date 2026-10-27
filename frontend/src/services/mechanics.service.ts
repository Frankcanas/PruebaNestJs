import { apiRequest } from './api';
import type { Mechanic } from '../types';

export const mechanicsService = {
  async getAll(): Promise<Mechanic[]> {
    return apiRequest<Mechanic[]>('/mechanics');
  },

  async getById(id: string): Promise<Mechanic> {
    return apiRequest<Mechanic>(`/mechanics/${id}`);
  },

  async create(data: { userId: string; specialty: string }): Promise<Mechanic> {
    return apiRequest<Mechanic>('/mechanics', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async validateAvailability(id: string, date: string): Promise<{ available: boolean; mechanicId: string; date: string }> {
    return apiRequest<{ available: boolean; mechanicId: string; date: string }>(
      `/mechanics/${id}/validate-availability?date=${encodeURIComponent(date)}`,
    );
  },
};
