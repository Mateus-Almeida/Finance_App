import api from './api';
import { Income } from '@/types';

// ============================================
// SERVIÇO DE RENDAS
// ============================================

export interface CreateIncomeData {
  description: string;
  amount: number;
  month: number;
  year: number;
  isFixed?: boolean;
}

export const incomeService = {
  async getAll(month?: number, year?: number): Promise<Income[]> {
    const params = month && year ? { month, year } : {};
    const response = await api.get('/incomes', { params });
    return response.data;
  },

  async getById(id: string): Promise<Income> {
    const response = await api.get(`/incomes/${id}`);
    return response.data;
  },

  async create(data: CreateIncomeData): Promise<Income> {
    const response = await api.post('/incomes', data);
    return response.data;
  },

  async update(id: string, data: Partial<CreateIncomeData>): Promise<Income> {
    const response = await api.patch(`/incomes/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/incomes/${id}`);
  },

  async getTotal(month: number, year: number): Promise<number> {
    const response = await api.get('/incomes/total', {
      params: { month, year },
    });
    return response.data.total;
  },
};
