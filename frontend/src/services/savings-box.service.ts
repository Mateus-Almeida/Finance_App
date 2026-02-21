import api from './api';
import { SavingsBox } from '@/types';

export const savingsBoxService = {
  async getAll(): Promise<SavingsBox[]> {
    const response = await api.get('/savings-boxes');
    return response.data;
  },

  async getById(id: string): Promise<SavingsBox> {
    const response = await api.get(`/savings-boxes/${id}`);
    return response.data;
  },

  async getTotal(): Promise<{ total: number }> {
    const response = await api.get('/savings-boxes/total');
    return response.data;
  },

  async create(data: {
    name: string;
    goal?: number;
    color?: string;
    icon?: string;
  }): Promise<SavingsBox> {
    const response = await api.post('/savings-boxes', data);
    return response.data;
  },

  async update(
    id: string,
    data: {
      name?: string;
      goal?: number;
      color?: string;
      icon?: string;
    },
  ): Promise<SavingsBox> {
    const response = await api.patch(`/savings-boxes/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/savings-boxes/${id}`);
  },

  async deposit(savingsBoxId: string, amount: number, description?: string): Promise<SavingsBox> {
    const response = await api.post('/savings-boxes/deposit', {
      savingsBoxId,
      amount,
      description,
    });
    return response.data;
  },

  async withdraw(savingsBoxId: string, amount: number, description?: string): Promise<SavingsBox> {
    const response = await api.post('/savings-boxes/withdraw', {
      savingsBoxId,
      amount,
      description,
    });
    return response.data;
  },
};
