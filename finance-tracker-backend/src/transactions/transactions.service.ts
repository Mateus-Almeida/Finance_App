import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { Installment } from '../installments/entities/installment.entity';
import { Category, CategoryType } from '../categories/entities/category.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Installment)
    private installmentRepository: Repository<Installment>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  /**
   * Cria uma transação e, se for parcelada, gera os registros individuais de parcelas
   */
  async create(
    createTransactionDto: CreateTransactionDto,
    userId: string,
  ): Promise<Transaction> {
    const {
      categoryId,
      description,
      amount,
      transactionDate,
      month,
      year,
      isFixed,
      isInstallment,
      totalInstallments,
    } = createTransactionDto;

    // Verifica se a categoria existe
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundException('Categoria não encontrada');
    }

    // Gera um grupo ID único para parcelas
    const installmentGroupId = isInstallment ? uuidv4() : null;

    // Cria a transação principal
    const transaction = this.transactionRepository.create({
      userId,
      categoryId,
      description,
      amount,
      transactionDate: new Date(transactionDate),
      month,
      year,
      isFixed: isFixed || false,
      isInstallment: isInstallment || false,
      totalInstallments: totalInstallments || 1,
      installmentGroupId,
    });

    const savedTransaction = await this.transactionRepository.save(transaction);

    // Se for parcelada, cria os registros individuais de parcelas
    if (isInstallment && totalInstallments && totalInstallments > 1) {
      await this.createInstallments(
        savedTransaction,
        userId,
        amount,
        totalInstallments,
        month,
        year,
      );
    }

    return this.findOne(savedTransaction.id, userId);
  }

  /**
   * Cria os registros individuais de parcelas para cada mês
   */
  private async createInstallments(
    transaction: Transaction,
    userId: string,
    totalAmount: number,
    totalInstallments: number,
    startMonth: number,
    startYear: number,
  ): Promise<void> {
    const installmentAmount = totalAmount / totalInstallments;
    const installments: Installment[] = [];

    let currentMonth = startMonth;
    let currentYear = startYear;

    for (let i = 1; i <= totalInstallments; i++) {
      const installment = this.installmentRepository.create({
        userId,
        transactionId: transaction.id,
        installmentNumber: i,
        totalInstallments,
        amount: parseFloat(installmentAmount.toFixed(2)),
        dueMonth: currentMonth,
        dueYear: currentYear,
        isPaid: i === 1, // Primeira parcela já vem como paga (opcional)
        paidAt: i === 1 ? new Date() : null,
      });

      installments.push(installment);

      // Avança para o próximo mês
      currentMonth++;
      if (currentMonth > 12) {
        currentMonth = 1;
        currentYear++;
      }
    }

    await this.installmentRepository.save(installments);
  }

  /**
   * Busca todas as transações de um usuário
   */
  async findAll(
    userId: string,
    month?: number,
    year?: number,
  ): Promise<Transaction[]> {
    const where: any = { userId };

    if (month && year) {
      where.month = month;
      where.year = year;
    }

    return this.transactionRepository.find({
      where,
      relations: ['category', 'installments'],
      order: { transactionDate: 'DESC' },
    });
  }

  /**
   * Busca uma transação específica
   */
  async findOne(id: string, userId: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOne({
      where: { id, userId },
      relations: ['category', 'installments'],
    });

    if (!transaction) {
      throw new NotFoundException('Transação não encontrada');
    }

    return transaction;
  }

  /**
   * Atualiza uma transação
   */
  async update(
    id: string,
    updateTransactionDto: UpdateTransactionDto,
    userId: string,
  ): Promise<Transaction> {
    const transaction = await this.findOne(id, userId);

    // Se for parcelada, não permite alteração direta (deve excluir e recriar)
    if (transaction.isInstallment && transaction.installments?.length > 0) {
      throw new BadRequestException(
        'Transações parceladas não podem ser editadas diretamente. Exclua e recrie a transação.',
      );
    }

    Object.assign(transaction, updateTransactionDto);
    return this.transactionRepository.save(transaction);
  }

  /**
   * Remove uma transação e suas parcelas associadas
   */
  async remove(id: string, userId: string): Promise<void> {
    const transaction = await this.findOne(id, userId);

    // Remove as parcelas associadas
    if (transaction.installments?.length > 0) {
      await this.installmentRepository.remove(transaction.installments);
    }

    await this.transactionRepository.remove(transaction);
  }

  /**
   * Obtém o resumo mensal com categorização 50/30/20
   */
  async getMonthlySummary(
    userId: string,
    month: number,
    year: number,
  ): Promise<any> {
    const transactions = await this.transactionRepository.find({
      where: { userId, month, year },
      relations: ['category'],
    });

    const summary = {
      essential: { total: 0, percentage: 0, transactions: [] },
      lifestyle: { total: 0, percentage: 0, transactions: [] },
      debtsInvestments: { total: 0, percentage: 0, transactions: [] },
      total: 0,
    };

    transactions.forEach((transaction) => {
      const amount = parseFloat(transaction.amount.toString());
      summary.total += amount;

      switch (transaction.category.type) {
        case CategoryType.ESSENTIAL:
          summary.essential.total += amount;
          summary.essential.transactions.push(transaction);
          break;
        case CategoryType.LIFESTYLE:
          summary.lifestyle.total += amount;
          summary.lifestyle.transactions.push(transaction);
          break;
        case CategoryType.DEBTS_INVESTMENTS:
          summary.debtsInvestments.total += amount;
          summary.debtsInvestments.transactions.push(transaction);
          break;
      }
    });

    // Calcula as porcentagens
    if (summary.total > 0) {
      summary.essential.percentage = parseFloat(
        ((summary.essential.total / summary.total) * 100).toFixed(2),
      );
      summary.lifestyle.percentage = parseFloat(
        ((summary.lifestyle.total / summary.total) * 100).toFixed(2),
      );
      summary.debtsInvestments.percentage = parseFloat(
        ((summary.debtsInvestments.total / summary.total) * 100).toFixed(2),
      );
    }

    return summary;
  }

  /**
   * Obtém a projeção de gastos para os próximos meses
   */
  async getProjection(userId: string, months: number): Promise<any[]> {
    const projections = [];
    const today = new Date();
    let currentMonth = today.getMonth() + 1;
    let currentYear = today.getFullYear();

    for (let i = 0; i < months; i++) {
      // Busca parcelas pendentes para o mês
      const installments = await this.installmentRepository.find({
        where: {
          userId,
          dueMonth: currentMonth,
          dueYear: currentYear,
        },
        relations: ['transaction', 'transaction.category'],
      });

      // Busca transações fixas do mês
      const fixedTransactions = await this.transactionRepository.find({
        where: {
          userId,
          isFixed: true,
          month: currentMonth,
          year: currentYear,
        },
        relations: ['category'],
      });

      const installmentTotal = installments.reduce(
        (sum, inst) => sum + parseFloat(inst.amount.toString()),
        0,
      );

      const fixedTotal = fixedTransactions.reduce(
        (sum, t) => sum + parseFloat(t.amount.toString()),
        0,
      );

      projections.push({
        month: currentMonth,
        year: currentYear,
        monthName: this.getMonthName(currentMonth),
        installmentTotal,
        fixedTotal,
        total: installmentTotal + fixedTotal,
        installments: installments.map((inst) => ({
          id: inst.id,
          description: inst.transaction.description,
          amount: inst.amount,
          installmentNumber: inst.installmentNumber,
          totalInstallments: inst.totalInstallments,
          category: inst.transaction.category.name,
          categoryType: inst.transaction.category.type,
        })),
        fixedTransactions: fixedTransactions.map((t) => ({
          id: t.id,
          description: t.description,
          amount: t.amount,
          category: t.category.name,
          categoryType: t.category.type,
        })),
      });

      // Avança para o próximo mês
      currentMonth++;
      if (currentMonth > 12) {
        currentMonth = 1;
        currentYear++;
      }
    }

    return projections;
  }

  private getMonthName(month: number): string {
    const months = [
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro',
    ];
    return months[month - 1];
  }

  /**
   * Calcula o "Card de Realidade" - Saldo disponível real
   */
  async getRealityCard(
    userId: string,
    month: number,
    year: number,
    netSalary: number,
  ): Promise<any> {
    // Busca parcelas pendentes do mês
    const pendingInstallments = await this.installmentRepository.find({
      where: {
        userId,
        dueMonth: month,
        dueYear: year,
        isPaid: false,
      },
    });

    // Busca contas fixas do mês
    const fixedTransactions = await this.transactionRepository.find({
      where: {
        userId,
        isFixed: true,
        month,
        year,
      },
    });

    const installmentsTotal = pendingInstallments.reduce(
      (sum, inst) => sum + parseFloat(inst.amount.toString()),
      0,
    );

    const fixedTotal = fixedTransactions.reduce(
      (sum, t) => sum + parseFloat(t.amount.toString()),
      0,
    );

    const totalCommitments = installmentsTotal + fixedTotal;
    const availableBalance = netSalary - totalCommitments;

    return {
      netSalary,
      installmentsTotal,
      fixedTotal,
      totalCommitments,
      availableBalance,
      pendingInstallmentsCount: pendingInstallments.length,
      percentageCommitted: parseFloat(
        ((totalCommitments / netSalary) * 100).toFixed(2),
      ),
      percentageAvailable: parseFloat(
        ((availableBalance / netSalary) * 100).toFixed(2),
      ),
    };
  }
}
