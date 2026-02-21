import api from './api';
import { PaymentMethod, PaymentMethodType } from '../types';

export interface CreatePaymentMethodDto {
  name: string;
  type: PaymentMethodType;
  cardLimit?: number;
  closingDay?: number;
  dueDay?: number;
  color?: string;
  icon?: string;
}

export interface UpdatePaymentMethodDto extends Partial<CreatePaymentMethodDto> {
  active?: boolean;
}

export interface PaymentMethodSummary {
  paymentMethodId: string;
  paymentMethodName: string;
  paymentMethodType: PaymentMethodType;
  total: number;
}

export interface TypeSummary {
  type: PaymentMethodType;
  total: number;
}

export interface PaymentMethodAnalytics {
  byPaymentMethod: PaymentMethodSummary[];
  byType: TypeSummary[];
  totals: {
    onCard: number;
    offCard: number;
  };
}

export const paymentMethodService = {
  async getAll(includeInactive: boolean = false): Promise<PaymentMethod[]> {
    const params = includeInactive ? { includeInactive: 'true' } : {};
    const response = await api.get('/payment-methods', { params });
    return response.data;
  },

  async getById(id: string): Promise<PaymentMethod> {
    const response = await api.get(`/payment-methods/${id}`);
    return response.data;
  },

  async getByType(type: PaymentMethodType): Promise<PaymentMethod[]> {
    const response = await api.get(`/payment-methods/type/${type}`);
    return response.data;
  },

  async create(data: CreatePaymentMethodDto): Promise<PaymentMethod> {
    const response = await api.post('/payment-methods', data);
    return response.data;
  },

  async update(id: string, data: UpdatePaymentMethodDto): Promise<PaymentMethod> {
    const response = await api.patch(`/payment-methods/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/payment-methods/${id}`);
  },

  async deactivate(id: string): Promise<PaymentMethod> {
    const response = await api.patch(`/payment-methods/${id}/deactivate`);
    return response.data;
  },

  async activate(id: string): Promise<PaymentMethod> {
    const response = await api.patch(`/payment-methods/${id}/activate`);
    return response.data;
  },

  async getAnalytics(month?: number, year?: number): Promise<PaymentMethodAnalytics> {
    const params: any = {};
    if (month) params.month = month;
    if (year) params.year = year;
    const response = await api.get('/analytics/payment-methods', { params });
    return response.data;
  },
};
