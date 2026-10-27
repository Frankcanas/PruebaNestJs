import { apiRequest } from './api';
import type { AuthResponse, User } from '../types';

export const authService = {
  async login(email: string, password: string):Promise<AuthResponse> {
    return apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async register(fullName: string, email: string, password: string, role: string): Promise<User> {
    return apiRequest<User>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ fullName, email, password, role }),
    });
  },

  async getProfile(): Promise<User> {
    return apiRequest<User>('/auth/profile', {
      method: 'GET',
    });
  },
};
