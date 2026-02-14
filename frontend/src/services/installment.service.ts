import api from './api';
import { Installment } from '@/types';

// ============================================
// SERVIÇO DE PARCELAS
// ============================================

export const installmentService = {
  async getAll(month?: number, year?: number): Promise<Installment[]> {
    const params = month && year ? { month, year } : {};
    const response = await api.get('/installments', { params });
    return response.data;
  },

  async getPending(month?: number, year?: number): Promise<Installment[]> {
    const params = month && year ? { month, year } : {};
    const response = await api.get('/installments/pending', { params });
    return response.data;
  },

  async getUpcoming(limit: number = 5): Promise<Installment[]> {
    const response = await api.get('/installments/upcoming', { params: { limit } });
    return response.data;
  },

  async getById(id: string): Promise<Installment> {
    const response = await api.get(`/installments/${id}`);
    return response.data;
  },

  async markAsPaid(id: string): Promise<Installment> {
    const response = await api.patch(`/installments/${id}/pay`);
    return response.data;
  },

  async markAsUnpaid(id: string): Promise<Installment> {
    const response = await api.patch(`/installments/${id}/unpay`);
    return response.data;
  },

  async getTotalPending(month: number, year: number): Promise<number> {
    const response = await api.get('/installments/total-pending', {
      params: { month, year },
    });
    return response.data.total;
  },
};
