import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Transaction } from '../../transactions/entities/transaction.entity';
import { Income } from '../../incomes/entities/income.entity';
import { Category } from '../../categories/entities/category.entity';
import { Installment } from '../../installments/entities/installment.entity';
import { SavingsBox } from '../../savings-box/entities/savings-box.entity';
import { PaymentMethod } from '../../payment-methods/entities/payment-method.entity';
import { Goal } from '../../goals/entities/goal.entity';
import { InvestmentAsset } from '../../investments/entities/investment-asset.entity';
import { InvestmentMovement } from '../../investments/entities/investment-movement.entity';

export enum UserRole {
  ADMIN = 'ADMIN',
  NORMAL = 'NORMAL',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.NORMAL,
  })
  role: UserRole;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Transaction, (transaction) => transaction.user)
  transactions: Transaction[];

  @OneToMany(() => Income, (income) => income.user)
  incomes: Income[];

  @OneToMany(() => Category, (category) => category.user)
  categories: Category[];

  @OneToMany(() => Installment, (installment) => installment.user)
  installments: Installment[];

  @OneToMany(() => SavingsBox, (savingsBox) => savingsBox.user)
  savingsBoxes: SavingsBox[];

  @OneToMany(() => PaymentMethod, (paymentMethod) => paymentMethod.user)
  paymentMethods: PaymentMethod[];

  @OneToMany(() => Goal, (goal) => goal.user)
  goals: Goal[];

  @OneToMany(() => InvestmentAsset, (asset) => asset.user)
  investmentAssets: InvestmentAsset[];

  @OneToMany(() => InvestmentMovement, (movement) => movement.user)
  investmentMovements: InvestmentMovement[];
}
