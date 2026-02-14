import { useState, useCallback } from 'react';
import { incomeService, CreateIncomeData } from '@/services/income.service';
import { Income } from '@/types';

// ============================================
// HOOK DE RENDAS
// ============================================

interface UseIncomesReturn {
  incomes: Income[];
  totalIncome: number;
  isLoading: boolean;
  error: string | null;
  fetchIncomes: (month?: number, year?: number) => Promise<void>;
  fetchTotal: (month: number, year: number) => Promise<void>;
  createIncome: (data: CreateIncomeData) => Promise<void>;
  updateIncome: (id: string, data: Partial<CreateIncomeData>) => Promise<void>;
  deleteIncome: (id: string) => Promise<void>;
}

export function useIncomes(): UseIncomesReturn {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchIncomes = useCallback(async (month?: number, year?: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await incomeService.getAll(month, year);
      setIncomes(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar rendas');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchTotal = useCallback(async (month: number, year: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const total = await incomeService.getTotal(month, year);
      setTotalIncome(total);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar total');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createIncome = useCallback(async (data: CreateIncomeData) => {
    try {
      setIsLoading(true);
      setError(null);
      await incomeService.create(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao criar renda');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateIncome = useCallback(async (id: string, data: Partial<CreateIncomeData>) => {
    try {
      setIsLoading(true);
      setError(null);
      await incomeService.update(id, data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao atualizar renda');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteIncome = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await incomeService.delete(id);
      setIncomes((prev) => prev.filter((i) => i.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao excluir renda');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    incomes,
    totalIncome,
    isLoading,
    error,
    fetchIncomes,
    fetchTotal,
    createIncome,
    updateIncome,
    deleteIncome,
  };
}
