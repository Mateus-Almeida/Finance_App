import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { Installment } from '../installments/entities/installment.entity';
import { Category } from '../categories/entities/category.entity';
import { SavingsBox } from '../savings-box/entities/savings-box.entity';
import { Income } from '../incomes/entities/income.entity';
import { TransactionType } from '../categories/entities/category.entity';
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
    @InjectRepository(SavingsBox)
    private savingsBoxRepository: Repository<SavingsBox>,
    @InjectRepository(Income)
    private incomeRepository: Repository<Income>,
  ) {}

  async create(
    createTransactionDto: CreateTransactionDto,
    userId: string,
  ): Promise<Transaction | Transaction[]> {
    const {
      categoryId,
      type,
      description,
      amount,
      transactionDate,
      competenceMonth,
      competenceYear,
      isFixed,
      isInstallment,
      totalInstallments,
      repeatMonthly,
      repeatMonths,
      isPaid,
      savingsBoxId,
      creditCardId,
      paymentMethodId,
    } = createTransactionDto;

    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundException('Categoria não encontrada');
    }

    if (type === TransactionType.INVESTMENT && savingsBoxId) {
      const savingsBox = await this.savingsBoxRepository.findOne({
        where: { id: savingsBoxId, userId },
      });
      if (!savingsBox) {
        throw new NotFoundException('Caixa de ahorro não encontrado');
      }
    }

    if (repeatMonthly && repeatMonths && repeatMonths > 1) {
      const transactions: Transaction[] = [];
      let currentMonth = competenceMonth;
      let currentYear = competenceYear;

      for (let i = 0; i < repeatMonths; i++) {
        const transactionDateObj = new Date(currentYear, currentMonth - 1, 15);

        const transaction = this.transactionRepository.create({
          userId,
          categoryId,
          type,
          description,
          amount,
          transactionDate: transactionDateObj,
          competenceMonth: currentMonth,
          competenceYear: currentYear,
          isFixed: isFixed || false,
          isInstallment: false,
          totalInstallments: 1,
          installmentGroupId: null,
          isPaid: isPaid || false,
          savingsBoxId: type === TransactionType.INVESTMENT ? savingsBoxId : null,
          creditCardId,
          paymentMethodId,
        });

        const saved = await this.transactionRepository.save(transaction);
        transactions.push(saved);

        currentMonth++;
        if (currentMonth > 12) {
          currentMonth = 1;
          currentYear++;
        }
      }

      return transactions;
    }

    const installmentGroupId = isInstallment ? uuidv4() : null;

    const transaction = this.transactionRepository.create({
      userId,
      categoryId,
      type,
      description,
      amount,
      transactionDate: new Date(transactionDate),
      competenceMonth,
      competenceYear,
      isFixed: isFixed || false,
      isInstallment: isInstallment || false,
      totalInstallments: totalInstallments || 1,
      installmentGroupId,
      isPaid: isPaid || false,
      savingsBoxId: type === TransactionType.INVESTMENT ? savingsBoxId : null,
      creditCardId,
      paymentMethodId,
    });

    const savedTransaction = await this.transactionRepository.save(transaction);

    if (isInstallment && totalInstallments && totalInstallments > 1) {
      await this.createInstallments(
        savedTransaction,
        userId,
        amount,
        totalInstallments,
        competenceMonth,
        competenceYear,
      );
    }

    if (type === TransactionType.INVESTMENT && savingsBoxId) {
      await this.updateSavingsBoxBalance(savingsBoxId, userId, amount);
    }

    return this.findOne(savedTransaction.id, userId);
  }

  private async updateSavingsBoxBalance(
    savingsBoxId: string,
    userId: string,
    amount: number,
  ): Promise<void> {
    await this.savingsBoxRepository.increment(
      { id: savingsBoxId, userId },
      'balance',
      amount,
    );
  }

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
        isPaid: i === 1,
        paidAt: i === 1 ? new Date() : null,
      });

      installments.push(installment);

      currentMonth++;
      if (currentMonth > 12) {
        currentMonth = 1;
        currentYear++;
      }
    }

    await this.installmentRepository.save(installments);
  }

  async findAll(
    userId: string,
    competenceMonth?: number,
    competenceYear?: number,
    type?: TransactionType,
  ): Promise<Transaction[]> {
    const where: any = { userId };

    if (competenceMonth && competenceYear) {
      where.competenceMonth = competenceMonth;
      where.competenceYear = competenceYear;
    }

    if (type) {
      where.type = type;
    }

    return this.transactionRepository.find({
      where,
      relations: ['category', 'savingsBox', 'paymentMethod'],
      order: { transactionDate: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOne({
      where: { id, userId },
      relations: ['category', 'savingsBox', 'installments'],
    });

    if (!transaction) {
      throw new NotFoundException('Transação não encontrada');
    }

    return transaction;
  }

  async update(
    id: string,
    updateTransactionDto: UpdateTransactionDto,
    userId: string,
  ): Promise<Transaction> {
    const transaction = await this.findOne(id, userId);

    const oldSavingsBoxId = transaction.savingsBoxId;
    const oldType = transaction.type;

    if (transaction.isInstallment && transaction.installments?.length > 0) {
      throw new BadRequestException(
        'Transações parceladas não podem ser editadas diretamente. Exclua e recrie a transação.',
      );
    }

    if (updateTransactionDto.categoryId) {
      const newCategory = await this.categoryRepository.findOne({
        where: { id: updateTransactionDto.categoryId },
      });
      if (newCategory) {
        transaction.category = newCategory;
        transaction.categoryId = newCategory.id;
      }
    }

    if (updateTransactionDto.type === TransactionType.INVESTMENT && updateTransactionDto.savingsBoxId) {
      const savingsBox = await this.savingsBoxRepository.findOne({
        where: { id: updateTransactionDto.savingsBoxId, userId },
      });
      if (!savingsBox) {
        throw new NotFoundException('Caixa de ahorro não encontrado');
      }
    }

    if (oldType === TransactionType.INVESTMENT && oldSavingsBoxId) {
      await this.savingsBoxRepository.decrement(
        { id: oldSavingsBoxId, userId },
        'balance',
        transaction.amount,
      );
    }

    if (updateTransactionDto.type) transaction.type = updateTransactionDto.type;
    if (updateTransactionDto.description) transaction.description = updateTransactionDto.description;
    if (updateTransactionDto.amount) transaction.amount = updateTransactionDto.amount;
    if (updateTransactionDto.transactionDate) transaction.transactionDate = new Date(updateTransactionDto.transactionDate);
    if (updateTransactionDto.competenceMonth) transaction.competenceMonth = updateTransactionDto.competenceMonth;
    if (updateTransactionDto.competenceYear) transaction.competenceYear = updateTransactionDto.competenceYear;
    if (updateTransactionDto.isFixed !== undefined) transaction.isFixed = updateTransactionDto.isFixed;
    if (updateTransactionDto.isInstallment !== undefined) transaction.isInstallment = updateTransactionDto.isInstallment;
    if (updateTransactionDto.totalInstallments) transaction.totalInstallments = updateTransactionDto.totalInstallments;
    if (updateTransactionDto.isPaid !== undefined) transaction.isPaid = updateTransactionDto.isPaid;
    if (updateTransactionDto.savingsBoxId !== undefined) transaction.savingsBoxId = updateTransactionDto.savingsBoxId;
    if (updateTransactionDto.creditCardId !== undefined) transaction.creditCardId = updateTransactionDto.creditCardId;

    await this.transactionRepository.save(transaction);

    if (transaction.type === TransactionType.INVESTMENT && transaction.savingsBoxId) {
      await this.updateSavingsBoxBalance(transaction.savingsBoxId, userId, transaction.amount);
    }

    return this.findOne(id, userId);
  }

  async remove(id: string, userId: string): Promise<void> {
    const transaction = await this.findOne(id, userId);

    if (transaction.type === TransactionType.INVESTMENT && transaction.savingsBoxId) {
      await this.savingsBoxRepository.decrement(
        { id: transaction.savingsBoxId, userId },
        'balance',
        transaction.amount,
      );
    }

    if (transaction.installments?.length > 0) {
      await this.installmentRepository.remove(transaction.installments);
    }

    await this.transactionRepository.remove(transaction);
  }

  async getMonthlyFinancialSummary(
    userId: string,
    competenceMonth: number,
    competenceYear: number,
  ): Promise<{
    totalIncome: number;
    totalExpense: number;
    totalInvestment: number;
    balance: number;
    byCategory: { categoryId: string; categoryName: string; categoryColor: string; total: number }[];
    bySavingsBox: { savingsBoxId: string; savingsBoxName: string; savingsBoxColor: string; total: number }[];
  }> {
    const transactions = await this.transactionRepository.find({
      where: {
        userId,
        competenceMonth,
        competenceYear,
      },
      relations: ['category', 'savingsBox'],
    });

    const incomes = await this.incomeRepository.find({
      where: {
        userId,
        month: competenceMonth,
        year: competenceYear,
      },
    });

    let totalIncome = incomes.reduce((sum, inc) => sum + Number(inc.amount), 0);
    let totalExpense = 0;
    let totalInvestment = 0;
    const categoryMap = new Map<string, { categoryId: string; categoryName: string; categoryColor: string; total: number }>();
    const savingsBoxMap = new Map<string, { savingsBoxId: string; savingsBoxName: string; savingsBoxColor: string; total: number }>();

    for (const transaction of transactions) {
      const amount = parseFloat(transaction.amount.toString());

      if (transaction.type === TransactionType.INCOME) {
        totalIncome += amount;
      } else if (transaction.type === TransactionType.EXPENSE) {
        totalExpense += amount;

        const catKey = transaction.categoryId;
        const existing = categoryMap.get(catKey);
        if (existing) {
          existing.total += amount;
        } else {
          categoryMap.set(catKey, {
            categoryId: catKey,
            categoryName: transaction.category?.name || 'Sem categoria',
            categoryColor: transaction.category?.color || '#6b7280',
            total: amount,
          });
        }
      } else if (transaction.type === TransactionType.INVESTMENT) {
        totalInvestment += amount;

        if (transaction.savingsBoxId) {
          const boxKey = transaction.savingsBoxId;
          const existing = savingsBoxMap.get(boxKey);
          if (existing) {
            existing.total += amount;
          } else {
            savingsBoxMap.set(boxKey, {
              savingsBoxId: boxKey,
              savingsBoxName: transaction.savingsBox?.name || 'Sem caixa',
              savingsBoxColor: transaction.savingsBox?.color || '#10b981',
              total: amount,
            });
          }
        }
      }
    }

    return {
      totalIncome: parseFloat(totalIncome.toFixed(2)),
      totalExpense: parseFloat(totalExpense.toFixed(2)),
      totalInvestment: parseFloat(totalInvestment.toFixed(2)),
      balance: parseFloat((totalIncome - totalExpense - totalInvestment).toFixed(2)),
      byCategory: Array.from(categoryMap.values()).sort((a, b) => b.total - a.total),
      bySavingsBox: Array.from(savingsBoxMap.values()).sort((a, b) => b.total - a.total),
    };
  }

  async getMonthlyComparison(
    userId: string,
    months: number = 12,
    year: number,
  ): Promise<{
    month: number;
    year: number;
    monthName: string;
    income: number;
    expense: number;
    investment: number;
    balance: number;
  }[]> {
    const result = [];
    const targetYear = year || new Date().getFullYear();

    for (let m = 1; m <= months; m++) {
      const summary = await this.getMonthlyFinancialSummary(userId, m, targetYear);

      result.push({
        month: m,
        year: targetYear,
        monthName: this.getMonthName(m),
        income: summary.totalIncome,
        expense: summary.totalExpense,
        investment: summary.totalInvestment,
        balance: summary.balance,
      });
    }

    return result;
  }

  async getEvolutionLastMonths(
    userId: string,
    months: number = 12,
    year: number,
  ): Promise<{
    month: number;
    year: number;
    monthName: string;
    balance: number;
  }[]> {
    const result = [];
    const targetYear = year || new Date().getFullYear();

    for (let m = 1; m <= months; m++) {
      const summary = await this.getMonthlyFinancialSummary(userId, m, targetYear);

      result.push({
        month: m,
        year: targetYear,
        monthName: this.getMonthName(m),
        balance: summary.balance,
      });
    }

    return result;
  }

  async getExpensesByCategory(
    userId: string,
    competenceMonth?: number,
    competenceYear?: number,
  ): Promise<{ categoryId: string; categoryName: string; categoryColor: string; total: number }[]> {
    const where: any = { userId, type: TransactionType.EXPENSE };

    if (competenceMonth && competenceYear) {
      where.competenceMonth = competenceMonth;
      where.competenceYear = competenceYear;
    }

    const transactions = await this.transactionRepository.find({
      where,
      relations: ['category'],
    });

    const categoryMap = new Map<string, { categoryId: string; categoryName: string; categoryColor: string; total: number }>();

    for (const transaction of transactions) {
      const amount = parseFloat(transaction.amount.toString());
      const catKey = transaction.categoryId;
      const existing = categoryMap.get(catKey);

      if (existing) {
        existing.total += amount;
      } else {
        categoryMap.set(catKey, {
          categoryId: catKey,
          categoryName: transaction.category?.name || 'Sem categoria',
          categoryColor: transaction.category?.color || '#6b7280',
          total: amount,
        });
      }
    }

    return Array.from(categoryMap.values())
      .map((item) => ({ ...item, total: parseFloat(item.total.toFixed(2)) }))
      .sort((a, b) => b.total - a.total);
  }

  async getInvestmentsBySavingsBox(
    userId: string,
    competenceMonth?: number,
    competenceYear?: number,
  ): Promise<{ savingsBoxId: string; savingsBoxName: string; savingsBoxColor: string; total: number }[]> {
    const where: any = { userId, type: TransactionType.INVESTMENT };

    if (competenceMonth && competenceYear) {
      where.competenceMonth = competenceMonth;
      where.competenceYear = competenceYear;
    }

    const transactions = await this.transactionRepository.find({
      where,
      relations: ['savingsBox'],
    });

    const savingsBoxMap = new Map<string, { savingsBoxId: string; savingsBoxName: string; savingsBoxColor: string; total: number }>();

    for (const transaction of transactions) {
      if (!transaction.savingsBoxId) continue;

      const amount = parseFloat(transaction.amount.toString());
      const boxKey = transaction.savingsBoxId;
      const existing = savingsBoxMap.get(boxKey);

      if (existing) {
        existing.total += amount;
      } else {
        savingsBoxMap.set(boxKey, {
          savingsBoxId: boxKey,
          savingsBoxName: transaction.savingsBox?.name || 'Sem caixa',
          savingsBoxColor: transaction.savingsBox?.color || '#10b981',
          total: amount,
        });
      }
    }

    return Array.from(savingsBoxMap.values())
      .map((item) => ({ ...item, total: parseFloat(item.total.toFixed(2)) }))
      .sort((a, b) => b.total - a.total);
  }

  private getMonthName(month: number): string {
    const months = [
      'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
    ];
    return months[month - 1];
  }

  async getProjection(userId: string, months: number): Promise<any[]> {
    const projections = [];
    const today = new Date();
    let currentMonth = today.getMonth() + 1;
    let currentYear = today.getFullYear();

    for (let i = 0; i < months; i++) {
      const installments = await this.installmentRepository.find({
        where: {
          userId,
          dueMonth: currentMonth,
          dueYear: currentYear,
        },
        relations: ['transaction', 'transaction.category'],
      });

      const fixedTransactions = await this.transactionRepository.find({
        where: {
          userId,
          isFixed: true,
          competenceMonth: currentMonth,
          competenceYear: currentYear,
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
      });

      currentMonth++;
      if (currentMonth > 12) {
        currentMonth = 1;
        currentYear++;
      }
    }

    return projections;
  }
}
