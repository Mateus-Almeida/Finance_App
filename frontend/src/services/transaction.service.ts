import api from './api';
import { Transaction, MonthlySummary, ProjectionData } from '@/types';

// ============================================
// SERVIÇO DE TRANSAÇÕES
// ============================================

export interface CreateTransactionData {
  categoryId: string;
  description: string;
  amount: number;
  transactionDate: string;
  month: number;
  year: number;
  isFixed?: boolean;
  isInstallment?: boolean;
  totalInstallments?: number;
  repeatMonthly?: boolean;
  repeatMonths?: number;
  isPaid?: boolean;
}

export interface CategorySummary {
  name: string;
  type: string;
  color: string;
  total: number;
  count: number;
}

export const transactionService = {
  async getAll(month?: number, year?: number): Promise<Transaction[]> {
    const params: any = month && year ? { month, year } : {};
    const response = await api.get('/transactions', { params });
    return response.data;
  },

  async getById(id: string): Promise<Transaction> {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  },

  async create(data: CreateTransactionData): Promise<Transaction> {
    const response = await api.post('/transactions', data);
    return response.data;
  },

  async update(id: string, data: Partial<CreateTransactionData>): Promise<Transaction> {
    const response = await api.patch(`/transactions/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/transactions/${id}`);
  },

  async getMonthlySummary(month: number, year: number): Promise<MonthlySummary> {
    const response = await api.get('/transactions/summary', {
      params: { month, year },
    });
    return response.data;
  },

  async getProjection(months: number = 6): Promise<ProjectionData[]> {
    const response = await api.get('/transactions/projection', {
      params: { months },
    });
    return response.data;
  },

  async getByCategory(month?: number, year?: number): Promise<CategorySummary[]> {
    const params: any = {};
    if (month && year) {
      params.month = month;
      params.year = year;
    }
    const response = await api.get('/transactions/by-category', { params });
    return response.data;
  },
};
