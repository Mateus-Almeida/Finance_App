import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Income } from './entities/income.entity';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';

@Injectable()
export class IncomesService {
  constructor(
    @InjectRepository(Income)
    private incomeRepository: Repository<Income>,
  ) {}

  async create(
    createIncomeDto: CreateIncomeDto,
    userId: string,
  ): Promise<Income> {
    const income = this.incomeRepository.create({
      ...createIncomeDto,
      userId,
    });

    return this.incomeRepository.save(income);
  }

  async findAll(
    userId: string,
    month?: number,
    year?: number,
  ): Promise<Income[]> {
    const where: any = { userId };

    if (month && year) {
      where.month = month;
      where.year = year;
    }

    return this.incomeRepository.find({
      where,
      order: { year: 'DESC', month: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Income> {
    const income = await this.incomeRepository.findOne({
      where: { id, userId },
    });

    if (!income) {
      throw new NotFoundException('Renda não encontrada');
    }

    return income;
  }

  async update(
    id: string,
    updateIncomeDto: UpdateIncomeDto,
    userId: string,
  ): Promise<Income> {
    const income = await this.findOne(id, userId);

    Object.assign(income, updateIncomeDto);

    return this.incomeRepository.save(income);
  }

  async remove(id: string, userId: string): Promise<void> {
    const income = await this.findOne(id, userId);
    await this.incomeRepository.remove(income);
  }

  async getTotalIncome(
    userId: string,
    month: number,
    year: number,
  ): Promise<number> {
    const incomes = await this.incomeRepository.find({
      where: { userId, month, year },
    });

    return incomes.reduce(
      (sum, income) => sum + parseFloat(income.amount.toString()),
      0,
    );
  }
}
