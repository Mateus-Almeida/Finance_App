import api from './api';

export const dashboardService = {
  async getSummary(month: number, year: number) {
    const response = await api.get('/transactions/summary', {
      params: { month, year },
    });
    return response.data;
  },

  async getMonthlyComparison(months: number = 6) {
    const response = await api.get('/transactions/monthly-comparison', {
      params: { months },
    });
    return response.data;
  },

  async getEvolution(months: number = 6) {
    const response = await api.get('/transactions/evolution', {
      params: { months },
    });
    return response.data;
  },
};
