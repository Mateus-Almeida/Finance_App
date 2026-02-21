import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentMethod, PaymentMethodType } from './entities/payment-method.entity';
import { CreatePaymentMethodDto, UpdatePaymentMethodDto } from './dto/payment-method.dto';

@Injectable()
export class PaymentMethodService {
  constructor(
    @InjectRepository(PaymentMethod)
    private paymentMethodRepository: Repository<PaymentMethod>,
  ) {}

  async create(
    createPaymentMethodDto: CreatePaymentMethodDto,
    userId: string,
  ): Promise<PaymentMethod> {
    this.validateCardFields(createPaymentMethodDto);

    const paymentMethod = this.paymentMethodRepository.create({
      ...createPaymentMethodDto,
      userId,
    });

    return this.paymentMethodRepository.save(paymentMethod);
  }

  async findAll(userId: string, includeInactive: boolean = false): Promise<PaymentMethod[]> {
    const where: any = { userId };
    if (!includeInactive) {
      where.active = true;
    }

    return this.paymentMethodRepository.find({
      where,
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string, userId: string): Promise<PaymentMethod> {
    const paymentMethod = await this.paymentMethodRepository.findOne({
      where: { id, userId },
    });

    if (!paymentMethod) {
      throw new NotFoundException('Meio de pagamento não encontrado');
    }

    return paymentMethod;
  }

  async update(
    id: string,
    updatePaymentMethodDto: UpdatePaymentMethodDto,
    userId: string,
  ): Promise<PaymentMethod> {
    const paymentMethod = await this.findOne(id, userId);

    if (updatePaymentMethodDto.type && updatePaymentMethodDto.type !== PaymentMethodType.CREDIT_CARD) {
      updatePaymentMethodDto.cardLimit = undefined;
      updatePaymentMethodDto.closingDay = undefined;
      updatePaymentMethodDto.dueDay = undefined;
    }

    Object.assign(paymentMethod, updatePaymentMethodDto);

    return this.paymentMethodRepository.save(paymentMethod);
  }

  async remove(id: string, userId: string): Promise<void> {
    const paymentMethod = await this.findOne(id, userId);
    await this.paymentMethodRepository.remove(paymentMethod);
  }

  async deactivate(id: string, userId: string): Promise<PaymentMethod> {
    const paymentMethod = await this.findOne(id, userId);
    paymentMethod.active = false;
    return this.paymentMethodRepository.save(paymentMethod);
  }

  async activate(id: string, userId: string): Promise<PaymentMethod> {
    const paymentMethod = await this.findOne(id, userId);
    paymentMethod.active = true;
    return this.paymentMethodRepository.save(paymentMethod);
  }

  private validateCardFields(dto: CreatePaymentMethodDto): void {
    if (dto.type !== PaymentMethodType.CREDIT_CARD) {
      if (dto.cardLimit || dto.closingDay || dto.dueDay) {
        throw new BadRequestException(
          'Limite, dia de fechamento e dia de vencimento são válidos apenas para cartões de crédito',
        );
      }
    }

    if (dto.closingDay && (dto.closingDay < 1 || dto.closingDay > 31)) {
      throw new BadRequestException('Dia de fechamento deve estar entre 1 e 31');
    }

    if (dto.dueDay && (dto.dueDay < 1 || dto.dueDay > 31)) {
      throw new BadRequestException('Dia de vencimento deve estar entre 1 e 31');
    }
  }

  async getByType(userId: string, type: PaymentMethodType): Promise<PaymentMethod[]> {
    return this.paymentMethodRepository.find({
      where: { userId, type, active: true },
      order: { name: 'ASC' },
    });
  }
}
