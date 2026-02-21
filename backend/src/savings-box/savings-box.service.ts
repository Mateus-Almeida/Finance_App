import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SavingsBox } from './entities/savings-box.entity';
import {
  CreateSavingsBoxDto,
  UpdateSavingsBoxDto,
  DepositToSavingsBoxDto,
  WithdrawFromSavingsBoxDto,
} from './dto/savings-box.dto';

@Injectable()
export class SavingsBoxService {
  constructor(
    @InjectRepository(SavingsBox)
    private savingsBoxRepository: Repository<SavingsBox>,
  ) {}

  async create(
    createSavingsBoxDto: CreateSavingsBoxDto,
    userId: string,
  ): Promise<SavingsBox> {
    const savingsBox = this.savingsBoxRepository.create({
      ...createSavingsBoxDto,
      userId,
      balance: 0,
    });

    return this.savingsBoxRepository.save(savingsBox);
  }

  async findAll(userId: string): Promise<SavingsBox[]> {
    return this.savingsBoxRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<SavingsBox> {
    const savingsBox = await this.savingsBoxRepository.findOne({
      where: { id, userId },
    });

    if (!savingsBox) {
      throw new NotFoundException('Caixa de ahorro não encontrado');
    }

    return savingsBox;
  }

  async update(
    id: string,
    updateSavingsBoxDto: UpdateSavingsBoxDto,
    userId: string,
  ): Promise<SavingsBox> {
    const savingsBox = await this.findOne(id, userId);

    Object.assign(savingsBox, updateSavingsBoxDto);

    return this.savingsBoxRepository.save(savingsBox);
  }

  async remove(id: string, userId: string): Promise<void> {
    const savingsBox = await this.findOne(id, userId);

    if (savingsBox.balance > 0) {
      throw new BadRequestException(
        'Não é possível excluir um caixa de ahorro com saldo positivo',
      );
    }

    await this.savingsBoxRepository.remove(savingsBox);
  }

  async deposit(
    dto: DepositToSavingsBoxDto,
    userId: string,
  ): Promise<SavingsBox> {
    const savingsBox = await this.findOne(dto.savingsBoxId, userId);

    savingsBox.balance = parseFloat(
      (savingsBox.balance + dto.amount).toFixed(2),
    );

    return this.savingsBoxRepository.save(savingsBox);
  }

  async withdraw(
    dto: WithdrawFromSavingsBoxDto,
    userId: string,
  ): Promise<SavingsBox> {
    const savingsBox = await this.findOne(dto.savingsBoxId, userId);

    if (savingsBox.balance < dto.amount) {
      throw new BadRequestException('Saldo insuficiente');
    }

    savingsBox.balance = parseFloat(
      (savingsBox.balance - dto.amount).toFixed(2),
    );

    return this.savingsBoxRepository.save(savingsBox);
  }

  async getTotalSavings(userId: string): Promise<{ total: number }> {
    const result = await this.savingsBoxRepository
      .createQueryBuilder('savingsBox')
      .where('savingsBox.user_id = :userId', { userId })
      .select('SUM(savingsBox.balance)', 'total')
      .getRawOne();

    return { total: parseFloat(result?.total || '0') };
  }
}
