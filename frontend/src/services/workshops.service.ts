import { apiRequest } from './api';
import type { Workshop } from '../types';

export const workshopsService = {
  async getAll(): Promise<Workshop[]> {
    return apiRequest<Workshop[]>('/workshops');
  },

  async getActive(): Promise<Workshop[]> {
    return apiRequest<Workshop[]>('/workshops/active');
  },

  async getById(id: string): Promise<Workshop> {
    return apiRequest<Workshop>(`/workshops/${id}`);
  },

  async create(data: { name: string; address: string; phone: string; capacity: number }): Promise<Workshop> {
    return apiRequest<Workshop>('/workshops', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
