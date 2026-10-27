import { apiRequest } from './api';
import type { Maintenance } from '../types';

export const externalService = {
  async getVehicleHistory(plate: string, apiKey: string): Promise<Maintenance[]> {
    return apiRequest<Maintenance[]>(
      `/external/vehicles/${encodeURIComponent(plate)}/history`,
      { method: 'GET' },
      { 'x-api-key': apiKey },
    );
  },
};
