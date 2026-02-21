import { useState, useEffect, useCallback } from 'react';
import { cardsService, CardSummary } from '@/services/cards.service';
import { goalsService, GoalProgress } from '@/services/goals.service';
import { investmentsService, NetWorthData, InvestmentSummary } from '@/services/investments.service';
import { paymentMethodService, PaymentMethodAnalytics } from '@/services/payment-method.service';

export interface DashboardOverview {
  cards: CardSummary[];
  cardsLoading: boolean;
  goals: GoalProgress[];
  goalsLoading: boolean;
  netWorth: NetWorthData | null;
  investmentsSummary: InvestmentSummary | null;
  investmentsLoading: boolean;
  paymentMethodAnalytics: PaymentMethodAnalytics | null;
  paymentMethodsLoading: boolean;
}

export function useDashboardOverview(month: number, year: number) {
  const [data, setData] = useState<DashboardOverview>({
    cards: [],
    cardsLoading: true,
    goals: [],
    goalsLoading: true,
    netWorth: null,
    investmentsSummary: null,
    investmentsLoading: true,
    paymentMethodAnalytics: null,
    paymentMethodsLoading: true,
  });

  const fetchData = useCallback(async () => {
    try {
      const [cardsData, goalsData, netWorthData, investmentsSummaryData, paymentMethodData] = await Promise.all([
        cardsService.getSummary(month, year),
        goalsService.getProgress(month, year),
        investmentsService.getNetWorth(month, year),
        investmentsService.getSummary(),
        paymentMethodService.getAnalytics(month, year),
      ]);

      setData({
        cards: cardsData,
        cardsLoading: false,
        goals: goalsData,
        goalsLoading: false,
        netWorth: netWorthData,
        investmentsSummary: investmentsSummaryData,
        investmentsLoading: false,
        paymentMethodAnalytics: paymentMethodData,
        paymentMethodsLoading: false,
      });
    } catch (error) {
      console.error('Error loading dashboard overview:', error);
      setData(prev => ({
        ...prev,
        cardsLoading: false,
        goalsLoading: false,
        investmentsLoading: false,
        paymentMethodsLoading: false,
      }));
    }
  }, [month, year]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { ...data, refetch: fetchData };
}
