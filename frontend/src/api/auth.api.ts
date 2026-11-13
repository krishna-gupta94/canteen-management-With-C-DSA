import { api } from './client';
import { AuthResponse } from '../types/auth.types';

export const authApi = {
  loginStudent: (email: string, password: string) =>
    api.post<AuthResponse>('/student/login', { email, password }),

  loginAdmin: (email: string, password: string) =>
    api.post<AuthResponse>('/admin/login', { email, password }),

  registerStudent: (data: { name: string; email: string; password: string; phone?: string }) =>
    api.post<AuthResponse>('/student/register', data),

  getMe: () =>
    api.get<{ id: number; role: number }>('/auth/me'),

  logout: () =>
    api.post<{ success: boolean; message: string }>('/auth/logout'),
};
