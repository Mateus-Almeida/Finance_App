import api from './api';
import { RealityCardData } from '@/types';

// ============================================
// SERVIÇO DO DASHBOARD
// ============================================

export const dashboardService = {
  async getRealityCard(
    month: number,
    year: number,
    netSalary: number
  ): Promise<RealityCardData> {
    // Esta é uma simulação - em produção, você criaria um endpoint específico
    // ou calcularia a partir dos outros dados
    const [installmentsRes, fixedRes] = await Promise.all([
      api.get('/installments/total-pending', { params: { month, year } }),
      api.get('/transactions', { params: { month, year } }),
    ]);

    const installmentsTotal = installmentsRes.data.total || 0;
    
    // Filtrar transações fixas
    const fixedTransactions = fixedRes.data.filter((t: any) => t.isFixed);
    const fixedTotal = fixedTransactions.reduce(
      (sum: number, t: any) => sum + parseFloat(t.amount),
      0
    );

    const totalCommitments = installmentsTotal + fixedTotal;
    const availableBalance = netSalary - totalCommitments;

    return {
      netSalary,
      installmentsTotal,
      fixedTotal,
      totalCommitments,
      availableBalance,
      pendingInstallmentsCount: 0, // Seria calculado
      percentageCommitted: parseFloat(((totalCommitments / netSalary) * 100).toFixed(2)),
      percentageAvailable: parseFloat(((availableBalance / netSalary) * 100).toFixed(2)),
    };
  },
};
