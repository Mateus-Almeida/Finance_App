// ============================================
// TIPOS DO FINANCE TRACKER
// ============================================

export enum CategoryType {
  ESSENTIAL = 'ESSENTIAL',
  LIFESTYLE = 'LIFESTYLE',
  DEBTS_INVESTMENTS = 'DEBTS_INVESTMENTS',
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  color: string;
  icon?: string;
  userId?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Income {
  id: string;
  userId: string;
  description: string;
  amount: number;
  month: number;
  year: number;
  isFixed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Installment {
  id: string;
  userId: string;
  transactionId: string;
  installmentNumber: number;
  totalInstallments: number;
  amount: number;
  dueMonth: number;
  dueYear: number;
  isPaid: boolean;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
  transaction?: Transaction;
}

export interface Transaction {
  id: string;
  userId: string;
  categoryId: string;
  category?: Category;
  description: string;
  amount: number;
  transactionDate: string;
  month: number;
  year: number;
  isFixed: boolean;
  isInstallment: boolean;
  totalInstallments: number;
  installmentGroupId?: string;
  isPaid: boolean;
  createdAt: string;
  updatedAt: string;
  installments?: Installment[];
}

export interface MonthlySummary {
  essential: {
    total: number;
    percentage: number;
    transactions: Transaction[];
  };
  lifestyle: {
    total: number;
    percentage: number;
    transactions: Transaction[];
  };
  debtsInvestments: {
    total: number;
    percentage: number;
    transactions: Transaction[];
  };
  total: number;
}

export interface ProjectionData {
  month: number;
  year: number;
  monthName: string;
  installmentTotal: number;
  fixedTotal: number;
  total: number;
  installments: {
    id: string;
    description: string;
    amount: number;
    installmentNumber: number;
    totalInstallments: number;
    category: string;
    categoryType: CategoryType;
  }[];
  fixedTransactions: {
    id: string;
    description: string;
    amount: number;
    category: string;
    categoryType: CategoryType;
  }[];
}

export interface RealityCardData {
  netSalary: number;
  installmentsTotal: number;
  fixedTotal: number;
  totalCommitments: number;
  availableBalance: number;
  pendingInstallmentsCount: number;
  percentageCommitted: number;
  percentageAvailable: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}
