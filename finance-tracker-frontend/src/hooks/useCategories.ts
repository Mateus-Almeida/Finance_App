import { useState, useEffect, useCallback } from 'react';
import { categoryService, CreateCategoryData } from '@/services/category.service';
import { Category, CategoryType } from '@/types';

// ============================================
// HOOK DE CATEGORIAS
// ============================================

interface UseCategoriesReturn {
  categories: Category[];
  essentialCategories: Category[];
  lifestyleCategories: Category[];
  debtsInvestmentsCategories: Category[];
  isLoading: boolean;
  error: string | null;
  fetchCategories: () => Promise<void>;
  createCategory: (data: CreateCategoryData) => Promise<void>;
  updateCategory: (id: string, data: Partial<CreateCategoryData>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
}

export function useCategories(): UseCategoriesReturn {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const essentialCategories = categories.filter(
    (c) => c.type === CategoryType.ESSENTIAL
  );
  const lifestyleCategories = categories.filter(
    (c) => c.type === CategoryType.LIFESTYLE
  );
  const debtsInvestmentsCategories = categories.filter(
    (c) => c.type === CategoryType.DEBTS_INVESTMENTS
  );

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar categorias');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createCategory = useCallback(async (data: CreateCategoryData) => {
    try {
      setIsLoading(true);
      setError(null);
      await categoryService.create(data);
      await fetchCategories();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao criar categoria');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchCategories]);

  const updateCategory = useCallback(async (id: string, data: Partial<CreateCategoryData>) => {
    try {
      setIsLoading(true);
      setError(null);
      await categoryService.update(id, data);
      await fetchCategories();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao atualizar categoria');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchCategories]);

  const deleteCategory = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await categoryService.delete(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao excluir categoria');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    essentialCategories,
    lifestyleCategories,
    debtsInvestmentsCategories,
    isLoading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  };
}
