import api from './api';
import { Transaction, MonthlyFinancialSummary, ProjectionData, MonthlyComparison, EvolutionData, TransactionType } from '@/types';

export interface CreateTransactionData {
  categoryId: string;
  type: TransactionType;
  description: string;
  amount: number;
  transactionDate: string;
  competenceMonth: number;
  competenceYear: number;
  isFixed?: boolean;
  isInstallment?: boolean;
  totalInstallments?: number;
  repeatMonthly?: boolean;
  repeatMonths?: number;
  isPaid?: boolean;
  savingsBoxId?: string;
  creditCardId?: string;
  paymentMethodId?: string;
}

export const transactionService = {
  async getAll(month?: number, year?: number, type?: TransactionType): Promise<Transaction[]> {
    const params: any = {};
    if (month && year) {
      params.month = month;
      params.year = year;
    }
    if (type) {
      params.type = type;
    }
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

  async getMonthlySummary(month: number, year: number): Promise<MonthlyFinancialSummary> {
    const response = await api.get('/transactions/summary', {
      params: { month, year },
    });
    return response.data;
  },

  async getMonthlyComparison(months: number = 12, year?: number): Promise<MonthlyComparison[]> {
    const params: any = { months };
    if (year) {
      params.year = year;
    }
    const response = await api.get('/transactions/monthly-comparison', { params });
    return response.data;
  },

  async getEvolution(months: number = 12, year?: number): Promise<EvolutionData[]> {
    const params: any = { months };
    if (year) {
      params.year = year;
    }
    const response = await api.get('/transactions/evolution', { params });
    return response.data;
  },

  async getExpensesByCategory(month?: number, year?: number): Promise<{ categoryId: string; categoryName: string; categoryColor: string; total: number }[]> {
    const params: any = {};
    if (month && year) {
      params.month = month;
      params.year = year;
    }
    const response = await api.get('/transactions/by-category', { params });
    return response.data;
  },

  async getInvestmentsBySavingsBox(month?: number, year?: number): Promise<{ savingsBoxId: string; savingsBoxName: string; savingsBoxColor: string; total: number }[]> {
    const params: any = {};
    if (month && year) {
      params.month = month;
      params.year = year;
    }
    const response = await api.get('/transactions/by-savings-box', { params });
    return response.data;
  },

  async getProjection(months: number = 6): Promise<ProjectionData[]> {
    const response = await api.get('/transactions/projection', {
      params: { months },
    });
    return response.data;
  },
};
