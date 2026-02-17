import api from './api';
import { User, UserRole } from '@/types';

interface CreateUserData {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
}

interface UpdateUserData {
  email?: string;
  name?: string;
  role?: UserRole;
  password?: string;
}

export const userService = {
  async getAll(): Promise<User[]> {
    const response = await api.get('/users');
    return response.data;
  },

  async create(data: CreateUserData): Promise<User> {
    const response = await api.post('/users', data);
    return response.data;
  },

  async update(id: string, data: UpdateUserData): Promise<User> {
    const response = await api.patch(`/users/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  },

  async getProfile(): Promise<User> {
    const response = await api.get('/users/me');
    return response.data;
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await api.patch('/users/me', data);
    return response.data;
  },

  async deleteProfile(): Promise<void> {
    await api.delete('/users/me');
  },
};
