import api from './api';
import { GoalType, GoalStatus } from '../types';

export interface Goal {
  id: string;
  userId: string;
  name: string;
  type: GoalType;
  active: boolean;
  targetValue: number;
  categoryId?: string;
  paymentMethodId?: string;
  savingsBoxId?: string;
  warningPercent: number;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GoalProgress {
  goalId: string;
  goalName: string;
  goalType: GoalType;
  targetValue: number;
  currentValue: number;
  percentage: number;
  status: GoalStatus;
  color: string;
}

export interface CreateGoalDto {
  name: string;
  type: GoalType;
  targetValue: number;
  categoryId?: string;
  paymentMethodId?: string;
  savingsBoxId?: string;
  warningPercent?: number;
  color?: string;
}

export const goalsService = {
  async getAll(includeInactive: boolean = false): Promise<Goal[]> {
    const params = includeInactive ? { includeInactive: 'true' } : {};
    const response = await api.get('/goals', { params });
    return response.data;
  },

  async getById(id: string): Promise<Goal> {
    const response = await api.get(`/goals/${id}`);
    return response.data;
  },

  async getProgress(month?: number, year?: number): Promise<GoalProgress[]> {
    const params: any = {};
    if (month) params.month = month;
    if (year) params.year = year;
    const response = await api.get('/goals/progress', { params });
    return response.data;
  },

  async create(data: CreateGoalDto): Promise<Goal> {
    const response = await api.post('/goals', data);
    return response.data;
  },

  async update(id: string, data: Partial<CreateGoalDto>): Promise<Goal> {
    const response = await api.patch(`/goals/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/goals/${id}`);
  },
};
