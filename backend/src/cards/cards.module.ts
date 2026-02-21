import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CardsController } from './cards.controller';
import { CardsService } from './cards.service';
import { PaymentMethod } from '../payment-methods/entities/payment-method.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import { Installment } from '../installments/entities/installment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentMethod, Transaction, Installment])],
  controllers: [CardsController],
  providers: [CardsService],
  exports: [CardsService],
})
export class CardsModule {}
