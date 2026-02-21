import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaymentMethodService } from '../payment-methods/payment-method.service';
import { TransactionsService } from '../transactions/transactions.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../transactions/entities/transaction.entity';
import { PaymentMethodType } from '../payment-methods/entities/payment-method.entity';

interface AuthRequest {
  user: {
    userId: string;
    email: string;
    name: string;
  };
}

interface PaymentMethodSummary {
  paymentMethodId: string;
  paymentMethodName: string;
  paymentMethodType: PaymentMethodType;
  total: number;
}

interface TypeSummary {
  type: PaymentMethodType;
  total: number;
}

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(
    private readonly paymentMethodService: PaymentMethodService,
    private readonly transactionsService: TransactionsService,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
  ) {}

  @Get('payment-methods')
  async getPaymentMethodSummary(
    @Query('month') month: number,
    @Query('year') year: number,
    @Request() req: AuthRequest,
  ) {
    const userId = req.user.userId;
    const today = new Date();
    const targetMonth = month || today.getMonth() + 1;
    const targetYear = year || today.getFullYear();

    const result = await this.transactionRepository
      .createQueryBuilder('t')
      .leftJoin('t.paymentMethod', 'pm')
      .where('t.user_id = :userId', { userId })
      .andWhere('t.competence_month = :month', { month: targetMonth })
      .andWhere('t.competence_year = :year', { year: targetYear })
      .andWhere('t.type = :type', { type: 'EXPENSE' })
      .select([
        'COALESCE(pm.id, :cashId) as paymentMethodId',
        'COALESCE(pm.name, :cashName) as paymentMethodName',
        'COALESCE(pm.type, :cashType) as paymentMethodType',
        'SUM(t.amount) as total',
      ])
      .setParameters({
        cashId: 'cash',
        cashName: 'Dinheiro',
        cashType: PaymentMethodType.CASH,
      })
      .groupBy('pm.id')
      .addGroupBy('pm.name')
      .addGroupBy('pm.type')
      .orderBy('total', 'DESC')
      .getRawMany();

    const byType = await this.transactionRepository
      .createQueryBuilder('t')
      .leftJoin('t.paymentMethod', 'pm')
      .where('t.user_id = :userId', { userId })
      .andWhere('t.competence_month = :month', { month: targetMonth })
      .andWhere('t.competence_year = :year', { year: targetYear })
      .andWhere('t.type = :type', { type: 'EXPENSE' })
      .select([
        'COALESCE(pm.type, :cashType) as type',
        'SUM(t.amount) as total',
      ])
      .setParameters({
        cashType: PaymentMethodType.CASH,
      })
      .groupBy('pm.type')
      .orderBy('total', 'DESC')
      .getRawMany();

    const cardTotal = byType.find((t) => t.type === PaymentMethodType.CREDIT_CARD)?.total || 0;
    const nonCardTotal = parseFloat(byType.reduce((sum, t) => sum + parseFloat(t.total || '0'), 0).toFixed(2)) - cardTotal;

    return {
      byPaymentMethod: result.map((r) => ({
        paymentMethodId: r.paymentMethodId,
        paymentMethodName: r.paymentMethodName,
        paymentMethodType: r.paymentMethodType,
        total: parseFloat(r.total || '0'),
      })),
      byType: byType.map((t) => ({
        type: t.type,
        total: parseFloat(t.total || '0'),
      })),
      totals: {
        onCard: parseFloat(cardTotal.toFixed(2)),
        offCard: parseFloat(nonCardTotal.toFixed(2)),
      },
    };
  }
}
