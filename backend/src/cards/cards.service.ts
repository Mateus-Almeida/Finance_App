import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentMethod, PaymentMethodType } from '../payment-methods/entities/payment-method.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import { Installment } from '../installments/entities/installment.entity';

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

@Injectable()
export class CardsService {
  constructor(
    @InjectRepository(PaymentMethod)
    private paymentMethodRepository: Repository<PaymentMethod>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Installment)
    private installmentRepository: Repository<Installment>,
  ) {}

  async getCardsSummary(userId: string, month: number, year: number): Promise<CardSummary[]> {
    const cards = await this.paymentMethodRepository.find({
      where: { userId, type: PaymentMethodType.CREDIT_CARD, active: true },
    });

    const summaries: CardSummary[] = [];

    for (const card of cards) {
      const { spent, competenceSpent, futureInstallments, estimatedBill } = 
        await this.getCardSpending(userId, card, month, year);

      summaries.push({
        paymentMethodId: card.id,
        paymentMethodName: card.name,
        cardLimit: card.cardLimit || 0,
        closingDay: card.closingDay || 0,
        dueDay: card.dueDay || 0,
        totalSpentCurrentMonth: spent,
        totalSpentCompetenceMonth: competenceSpent,
        totalFutureInstallments: futureInstallments,
        limitUsagePercent: card.cardLimit ? (spent / card.cardLimit) * 100 : 0,
        estimatedNextBill: estimatedBill,
      });
    }

    return summaries;
  }

  private async getCardSpending(
    userId: string, 
    card: PaymentMethod, 
    month: number, 
    year: number
  ) {
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    const invoiceMonth = currentDay <= (card.closingDay || 31) ? currentMonth : (currentMonth === 12 ? 1 : currentMonth + 1);
    const invoiceYear = currentDay <= (card.closingDay || 31) ? currentYear : (currentMonth === 12 ? currentYear + 1 : currentYear);

    const competenceSpent = await this.transactionRepository
      .createQueryBuilder('t')
      .where('t.user_id = :userId', { userId })
      .andWhere('t.payment_method_id = :cardId', { cardId: card.id })
      .andWhere('t.type = :type', { type: 'EXPENSE' })
      .andWhere('t.competence_month = :month', { month })
      .andWhere('t.competence_year = :year', { year })
      .select('SUM(t.amount)', 'total')
      .getRawOne();

    const currentSpent = await this.transactionRepository
      .createQueryBuilder('t')
      .where('t.user_id = :userId', { userId })
      .andWhere('t.payment_method_id = :cardId', { cardId: card.id })
      .andWhere('t.type = :type', { type: 'EXPENSE' })
      .andWhere('t.competence_month = :month', { month: invoiceMonth })
      .andWhere('t.competence_year = :year', { year: invoiceYear })
      .select('SUM(t.amount)', 'total')
      .getRawOne();

    const futureInstallments = await this.installmentRepository
      .createQueryBuilder('i')
      .innerJoin('i.transaction', 't')
      .where('t.user_id = :userId', { userId })
      .andWhere('t.payment_method_id = :cardId', { cardId: card.id })
      .andWhere('i.is_paid = :isPaid', { isPaid: false })
      .andWhere('(i.due_year > :year OR (i.due_year = :year AND i.due_month >= :month))', { 
        year: currentYear, 
        month: currentMonth 
      })
      .select('SUM(i.amount)', 'total')
      .getRawOne();

    return {
      spent: parseFloat(currentSpent?.total || '0'),
      competenceSpent: parseFloat(competenceSpent?.total || '0'),
      futureInstallments: parseFloat(futureInstallments?.total || '0'),
      estimatedBill: parseFloat(currentSpent?.total || '0') + parseFloat(futureInstallments?.total || '0'),
    };
  }

  async getCardTimeline(
    userId: string, 
    cardId: string, 
    months: number = 6
  ): Promise<CardTimelineMonth[]> {
    const card = await this.paymentMethodRepository.findOne({
      where: { id: cardId, userId, type: PaymentMethodType.CREDIT_CARD },
    });

    if (!card) {
      throw new NotFoundException('Cartão não encontrado');
    }

    const result: CardTimelineMonth[] = [];
    const today = new Date();
    let currentMonth = today.getMonth() + 1;
    let currentYear = today.getFullYear();

    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
    ];

    for (let i = 0; i < months; i++) {
      const invoiceMonth = currentMonth;
      const invoiceYear = currentYear;

      const spent = await this.transactionRepository
        .createQueryBuilder('t')
        .where('t.user_id = :userId', { userId })
        .andWhere('t.payment_method_id = :cardId', { cardId })
        .andWhere('t.type = :type', { type: 'EXPENSE' })
        .andWhere('t.competence_month = :month', { month: invoiceMonth })
        .andWhere('t.competence_year = :year', { year: invoiceYear })
        .select('SUM(t.amount)', 'total')
        .getRawOne();

      const isPaid = invoiceMonth < currentMonth || 
        (invoiceMonth === currentMonth && invoiceYear < currentYear);

      result.push({
        month: invoiceMonth,
        year: invoiceYear,
        monthName: monthNames[invoiceMonth - 1],
        total: parseFloat(spent?.total || '0'),
        isPaid,
      });

      currentMonth++;
      if (currentMonth > 12) {
        currentMonth = 1;
        currentYear++;
      }
    }

    return result;
  }

  async getCardTransactions(
    userId: string,
    cardId: string,
    invoiceMonth: number,
    invoiceYear: number
  ): Promise<CardInvoiceTransaction[]> {
    const card = await this.paymentMethodRepository.findOne({
      where: { id: cardId, userId, type: PaymentMethodType.CREDIT_CARD },
    });

    if (!card) {
      throw new NotFoundException('Cartão não encontrado');
    }

    const transactions = await this.transactionRepository
      .createQueryBuilder('t')
      .innerJoinAndSelect('t.category', 'c')
      .where('t.user_id = :userId', { userId })
      .andWhere('t.payment_method_id = :cardId', { cardId })
      .andWhere('t.type = :type', { type: 'EXPENSE' })
      .andWhere('t.competence_month = :month', { month: invoiceMonth })
      .andWhere('t.competence_year = :year', { year: invoiceYear })
      .orderBy('t.transaction_date', 'DESC')
      .select([
        't.id',
        't.description',
        't.amount',
        't.transaction_date',
        'c.name as categoryName',
        'c.color as categoryColor',
      ])
      .getRawMany();

    return transactions.map(t => ({
      id: t.t_id,
      description: t.t_description,
      amount: parseFloat(t.t_amount),
      categoryName: t.categoryName,
      categoryColor: t.categoryColor,
      transactionDate: t.t_transaction_date,
    }));
  }
}
