// ============================================
// TIPOS DO FINANCE TRACKER
// ============================================

export enum TransactionType {
  EXPENSE = 'EXPENSE',
  INCOME = 'INCOME',
  INVESTMENT = 'INVESTMENT',
}

export enum UserRole {
  ADMIN = 'ADMIN',
  NORMAL = 'NORMAL',
}

export enum PaymentMethodType {
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  PIX = 'PIX',
  CASH = 'CASH',
  TRANSFER = 'TRANSFER',
}

export enum GoalType {
  CATEGORY_LIMIT = 'CATEGORY_LIMIT',
  CARD_LIMIT = 'CARD_LIMIT',
  SAVING = 'SAVING',
  TARGET_VALUE = 'TARGET_VALUE',
}

export enum GoalStatus {
  OK = 'OK',
  WARNING = 'WARNING',
  EXCEEDED = 'EXCEEDED',
  NOT_STARTED = 'NOT_STARTED',
}

export enum InvestmentType {
  CDB = 'CDB',
  STOCK = 'STOCK',
  CRYPTO = 'CRYPTO',
  TREASURY = 'TREASURY',
  FUND = 'FUND',
  OTHER = 'OTHER',
}

export interface PaymentMethod {
  id: string;
  userId: string;
  name: string;
  type: PaymentMethodType;
  active: boolean;
  cardLimit?: number;
  closingDay?: number;
  dueDay?: number;
  color: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role?: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
  userId?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SavingsBox {
  id: string;
  userId: string;
  name: string;
  balance: number;
  goal?: number;
  color: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  categoryId: string;
  category?: Category;
  type: TransactionType;
  description: string;
  amount: number;
  transactionDate: string;
  competenceMonth: number;
  competenceYear: number;
  isFixed: boolean;
  isInstallment: boolean;
  totalInstallments: number;
  installmentGroupId?: string;
  isPaid: boolean;
  savingsBoxId?: string;
  savingsBox?: SavingsBox;
  creditCardId?: string;
  paymentMethodId?: string;
  paymentMethod?: PaymentMethod;
  createdAt: string;
  updatedAt: string;
  installments?: Installment[];
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

export interface MonthlyFinancialSummary {
  totalIncome: number;
  totalExpense: number;
  totalInvestment: number;
  balance: number;
  byCategory: {
    categoryId: string;
    categoryName: string;
    categoryColor: string;
    total: number;
  }[];
  bySavingsBox: {
    savingsBoxId: string;
    savingsBoxName: string;
    savingsBoxColor: string;
    total: number;
  }[];
}

export interface MonthlyComparison {
  month: number;
  year: number;
  monthName: string;
  income: number;
  expense: number;
  investment: number;
  balance: number;
}

export interface EvolutionData {
  month: number;
  year: number;
  monthName: string;
  balance: number;
}

export interface ProjectionData {
  month: number;
  year: number;
  monthName: string;
  installmentTotal: number;
  fixedTotal: number;
  total: number;
}

export interface CreditCard {
  id: string;
  userId: string;
  name: string;
  limit: number;
  currentSpend: number;
  color: string;
  dueDay: number;
  closingDay: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}
