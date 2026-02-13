import api from './api';
import { LoginCredentials, RegisterData, AuthResponse, User } from '@/types';

// ============================================
// SERVIÇO DE AUTENTICAÇÃO
// ============================================

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post('/auth/login', credentials);
    const { accessToken, user } = response.data;
    localStorage.setItem('token', accessToken);
    localStorage.setItem('user', JSON.stringify(user));
    return response.data;
  },

  async register(data: RegisterData): Promise<{ message: string }> {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },

  getUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};
