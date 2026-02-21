import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Category } from '../../categories/entities/category.entity';
import { Installment } from '../../installments/entities/installment.entity';
import { SavingsBox } from '../../savings-box/entities/savings-box.entity';
import { PaymentMethod } from '../../payment-methods/entities/payment-method.entity';
import { TransactionType } from '../../categories/entities/category.entity';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, (user) => user.transactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'category_id' })
  categoryId: string;

  @ManyToOne(() => Category, (category) => category.transactions, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({
    type: 'enum',
    enum: TransactionType,
    default: TransactionType.EXPENSE,
  })
  type: TransactionType;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ name: 'transaction_date', type: 'date' })
  transactionDate: Date;

  @Column({ name: 'competence_month' })
  competenceMonth: number;

  @Column({ name: 'competence_year' })
  competenceYear: number;

  @Column({ name: 'is_fixed', default: false })
  isFixed: boolean;

  @Column({ name: 'is_installment', default: false })
  isInstallment: boolean;

  @Column({ name: 'total_installments', default: 1 })
  totalInstallments: number;

  @Column({ name: 'installment_group_id', nullable: true })
  installmentGroupId: string;

  @Column({ name: 'is_paid', default: false })
  isPaid: boolean;

  @Column({ name: 'credit_card_id', nullable: true })
  creditCardId: string;

  @Column({ name: 'savings_box_id', nullable: true })
  savingsBoxId: string;

  @ManyToOne(() => SavingsBox, (savingsBox) => savingsBox.transactions, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'savings_box_id' })
  savingsBox: SavingsBox;

  @Column({ name: 'payment_method_id', nullable: true })
  paymentMethodId: string;

  @ManyToOne(() => PaymentMethod, (paymentMethod) => paymentMethod.transactions, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'payment_method_id' })
  paymentMethod: PaymentMethod;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Installment, (installment) => installment.transaction)
  installments: Installment[];
}
