import api from './api';
import { Category, CategoryType } from '@/types';

// ============================================
// SERVIÇO DE CATEGORIAS
// ============================================

export interface CreateCategoryData {
  name: string;
  type: CategoryType;
  color?: string;
  icon?: string;
}

export const categoryService = {
  async getAll(): Promise<Category[]> {
    const response = await api.get('/categories');
    return response.data;
  },

  async getByType(type: CategoryType): Promise<Category[]> {
    const response = await api.get('/categories', { params: { type } });
    return response.data;
  },

  async getById(id: string): Promise<Category> {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  async create(data: CreateCategoryData): Promise<Category> {
    const response = await api.post('/categories', data);
    return response.data;
  },

  async update(id: string, data: Partial<CreateCategoryData>): Promise<Category> {
    const response = await api.patch(`/categories/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/categories/${id}`);
  },
};
