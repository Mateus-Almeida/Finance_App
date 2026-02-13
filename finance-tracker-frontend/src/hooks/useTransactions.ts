import { useState, useEffect, useCallback } from 'react';
import { transactionService, CreateTransactionData } from '@/services/transaction.service';
import { Transaction, MonthlySummary, ProjectionData } from '@/types';

// ============================================
// HOOK DE TRANSAÇÕES
// ============================================

interface UseTransactionsReturn {
  transactions: Transaction[];
  summary: MonthlySummary | null;
  projection: ProjectionData[];
  isLoading: boolean;
  error: string | null;
  fetchTransactions: (month?: number, year?: number) => Promise<void>;
  fetchSummary: (month: number, year: number) => Promise<void>;
  fetchProjection: (months?: number) => Promise<void>;
  createTransaction: (data: CreateTransactionData) => Promise<void>;
  updateTransaction: (id: string, data: Partial<CreateTransactionData>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
}

export function useTransactions(): UseTransactionsReturn {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [projection, setProjection] = useState<ProjectionData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async (month?: number, year?: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await transactionService.getAll(month, year);
      setTransactions(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar transações');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchSummary = useCallback(async (month: number, year: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await transactionService.getMonthlySummary(month, year);
      setSummary(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar resumo');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchProjection = useCallback(async (months: number = 6) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await transactionService.getProjection(months);
      setProjection(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar projeção');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createTransaction = useCallback(async (data: CreateTransactionData) => {
    try {
      setIsLoading(true);
      setError(null);
      await transactionService.create(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao criar transação');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateTransaction = useCallback(async (id: string, data: Partial<CreateTransactionData>) => {
    try {
      setIsLoading(true);
      setError(null);
      await transactionService.update(id, data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao atualizar transação');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteTransaction = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await transactionService.delete(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao excluir transação');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    transactions,
    summary,
    projection,
    isLoading,
    error,
    fetchTransactions,
    fetchSummary,
    fetchProjection,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  };
}
