import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './analytics.controller';
import { PaymentMethodModule } from '../payment-methods/payment-method.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { Transaction } from '../transactions/entities/transaction.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction]),
    PaymentMethodModule,
    TransactionsModule,
  ],
  controllers: [AnalyticsController],
})
export class AnalyticsModule {}
