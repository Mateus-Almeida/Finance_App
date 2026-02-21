import { useState, useEffect, useCallback } from 'react';
import { transactionService } from '@/services/transaction.service';
import { savingsBoxService } from '@/services/savings-box.service';
import { MonthlyFinancialSummary, MonthlyComparison, EvolutionData, SavingsBox } from '@/types';

export interface DashboardData {
  summary: MonthlyFinancialSummary | null;
  comparison: MonthlyComparison[];
  evolution: EvolutionData[];
  savingsBoxes: SavingsBox[];
  totalSavings: number;
  loading: boolean;
  error: string | null;
}

export function useDashboard(month: number, year: number) {
  const [data, setData] = useState<DashboardData>({
    summary: null,
    comparison: [],
    evolution: [],
    savingsBoxes: [],
    totalSavings: 0,
    loading: true,
    error: null,
  });

  const fetchData = useCallback(async () => {
    setData((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const [summaryRes, comparisonRes, evolutionRes, savingsBoxesRes, totalSavingsRes] =
        await Promise.all([
          transactionService.getMonthlySummary(month, year),
          transactionService.getMonthlyComparison(12, year),
          transactionService.getEvolution(12, year),
          savingsBoxService.getAll(),
          savingsBoxService.getTotal(),
        ]);

      setData({
        summary: summaryRes,
        comparison: comparisonRes,
        evolution: evolutionRes,
        savingsBoxes: savingsBoxesRes,
        totalSavings: totalSavingsRes.total,
        loading: false,
        error: null,
      });
    } catch (error) {
      setData((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Erro ao carregar dados',
      }));
    }
  }, [month, year, transactionService, savingsBoxService]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { ...data, refetch: fetchData };
}
