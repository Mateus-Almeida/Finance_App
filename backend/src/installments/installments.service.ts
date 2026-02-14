import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Installment } from './entities/installment.entity';

@Injectable()
export class InstallmentsService {
  constructor(
    @InjectRepository(Installment)
    private installmentRepository: Repository<Installment>,
  ) {}

  async findAll(
    userId: string,
    month?: number,
    year?: number,
  ): Promise<Installment[]> {
    const where: any = { userId };

    if (month && year) {
      where.dueMonth = month;
      where.dueYear = year;
    }

    return this.installmentRepository.find({
      where,
      relations: ['transaction', 'transaction.category'],
      order: { dueYear: 'ASC', dueMonth: 'ASC', installmentNumber: 'ASC' },
    });
  }

  async findPending(
    userId: string,
    month?: number,
    year?: number,
  ): Promise<Installment[]> {
    const where: any = { userId, isPaid: false };

    if (month && year) {
      where.dueMonth = month;
      where.dueYear = year;
    }

    return this.installmentRepository.find({
      where,
      relations: ['transaction', 'transaction.category'],
      order: { dueYear: 'ASC', dueMonth: 'ASC', installmentNumber: 'ASC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Installment> {
    const installment = await this.installmentRepository.findOne({
      where: { id, userId },
      relations: ['transaction', 'transaction.category'],
    });

    if (!installment) {
      throw new NotFoundException('Parcela não encontrada');
    }

    return installment;
  }

  async markAsPaid(id: string, userId: string): Promise<Installment> {
    const installment = await this.findOne(id, userId);

    installment.isPaid = true;
    installment.paidAt = new Date();

    return this.installmentRepository.save(installment);
  }

  async markAsUnpaid(id: string, userId: string): Promise<Installment> {
    const installment = await this.findOne(id, userId);

    installment.isPaid = false;
    installment.paidAt = null;

    return this.installmentRepository.save(installment);
  }

  async getTotalPending(
    userId: string,
    month: number,
    year: number,
  ): Promise<number> {
    const installments = await this.installmentRepository.find({
      where: {
        userId,
        dueMonth: month,
        dueYear: year,
        isPaid: false,
      },
    });

    return installments.reduce(
      (sum, inst) => sum + parseFloat(inst.amount.toString()),
      0,
    );
  }

  async getUpcomingInstallments(
    userId: string,
    limit: number = 5,
  ): Promise<Installment[]> {
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    return this.installmentRepository.find({
      where: {
        userId,
        isPaid: false,
      },
      relations: ['transaction', 'transaction.category'],
      order: { dueYear: 'ASC', dueMonth: 'ASC', installmentNumber: 'ASC' },
      take: limit,
    });
  }
}
