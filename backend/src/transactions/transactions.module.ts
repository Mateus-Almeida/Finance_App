import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { Transaction } from './entities/transaction.entity';
import { Installment } from '../installments/entities/installment.entity';
import { Category } from '../categories/entities/category.entity';
import { SavingsBox } from '../savings-box/entities/savings-box.entity';
import { Income } from '../incomes/entities/income.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, Installment, Category, SavingsBox, Income])],
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [TransactionsService],
})
export class TransactionsModule {}
