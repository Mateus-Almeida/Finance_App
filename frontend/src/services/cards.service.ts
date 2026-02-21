import api from './api';

export interface CardSummary {
  paymentMethodId: string;
  paymentMethodName: string;
  cardLimit: number;
  closingDay: number;
  dueDay: number;
  totalSpentCurrentMonth: number;
  totalSpentCompetenceMonth: number;
  totalFutureInstallments: number;
  limitUsagePercent: number;
  estimatedNextBill: number;
}

export interface CardInvoiceTransaction {
  id: string;
  description: string;
  amount: number;
  categoryName: string;
  categoryColor: string;
  transactionDate: string;
}

export interface CardTimelineMonth {
  month: number;
  year: number;
  monthName: string;
  total: number;
  isPaid: boolean;
}

export const cardsService = {
  async getSummary(month?: number, year?: number): Promise<CardSummary[]> {
    const params: any = {};
    if (month) params.month = month;
    if (year) params.year = year;
    const response = await api.get('/cards/summary', { params });
    return response.data;
  },

  async getTimeline(cardId: string, months?: number): Promise<CardTimelineMonth[]> {
    const params: any = {};
    if (months) params.months = months;
    const response = await api.get(`/cards/${cardId}/timeline`, { params });
    return response.data;
  },

  async getTransactions(cardId: string, invoiceMonth: number, invoiceYear: number): Promise<CardInvoiceTransaction[]> {
    const response = await api.get(`/cards/${cardId}/transactions`, {
      params: { invoice_month: invoiceMonth, invoice_year: invoiceYear },
    });
    return response.data;
  },
};
