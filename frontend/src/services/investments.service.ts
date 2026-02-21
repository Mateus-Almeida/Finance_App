import api from './api';
import { InvestmentType } from '../types';

export interface InvestmentAsset {
  id: string;
  userId: string;
  name: string;
  type: InvestmentType;
  institution?: string;
  initialValue: number;
  currentValue: number;
  monthlyContribution?: number;
  active: boolean;
  color?: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvestmentMovement {
  id: string;
  userId: string;
  assetId: string;
  type: 'CONTRIBUTION' | 'WITHDRAWAL' | 'YIELD' | 'LOSS';
  amount: number;
  description?: string;
  movementDate: string;
  createdAt: string;
}

export interface InvestmentSummary {
  totalInvested: number;
  totalCurrentValue: number;
  totalYield: number;
  yieldPercent: number;
  monthlyContribution: number;
}

export interface NetWorthData {
  savingsBoxesTotal: number;
  investmentsTotal: number;
  assetsTotal: number;
  netWorth: number;
}

export interface EvolutionData {
  month: number;
  year: number;
  monthName: string;
  netWorth: number;
  savingsBoxes: number;
  investments: number;
}

export const investmentsService = {
  async getAssets(includeInactive: boolean = false): Promise<InvestmentAsset[]> {
    const params = includeInactive ? { includeInactive: 'true' } : {};
    const response = await api.get('/investments/assets', { params });
    return response.data;
  },

  async getAssetById(id: string): Promise<InvestmentAsset> {
    const response = await api.get(`/investments/assets/${id}`);
    return response.data;
  },

  async createAsset(data: {
    name: string;
    type: InvestmentType;
    institution?: string;
    initialValue: number;
    monthlyContribution?: number;
    color?: string;
    icon?: string;
  }): Promise<InvestmentAsset> {
    const response = await api.post('/investments/assets', data);
    return response.data;
  },

  async updateAsset(id: string, data: Partial<InvestmentAsset>): Promise<InvestmentAsset> {
    const response = await api.patch(`/investments/assets/${id}`, data);
    return response.data;
  },

  async deleteAsset(id: string): Promise<void> {
    await api.delete(`/investments/assets/${id}`);
  },

  async getMovements(assetId?: string): Promise<InvestmentMovement[]> {
    const params = assetId ? { assetId } : {};
    const response = await api.get('/investments/movements', { params });
    return response.data;
  },

  async createMovement(data: {
    assetId: string;
    type: 'CONTRIBUTION' | 'WITHDRAWAL' | 'YIELD' | 'LOSS';
    amount: number;
    description?: string;
    movementDate: string;
  }): Promise<InvestmentMovement> {
    const response = await api.post('/investments/movements', data);
    return response.data;
  },

  async getSummary(): Promise<InvestmentSummary> {
    const response = await api.get('/investments/summary');
    return response.data;
  },

  async getNetWorth(month?: number, year?: number): Promise<NetWorthData> {
    const params: any = {};
    if (month) params.month = month;
    if (year) params.year = year;
    const response = await api.get('/investments/net-worth', { params });
    return response.data;
  },

  async getEvolution(months?: number): Promise<EvolutionData[]> {
    const params: any = {};
    if (months) params.months = months;
    const response = await api.get('/investments/evolution', { params });
    return response.data;
  },
};
