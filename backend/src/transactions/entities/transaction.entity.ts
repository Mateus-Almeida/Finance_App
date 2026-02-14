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

  @Column()
  description: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ name: 'transaction_date', type: 'date' })
  transactionDate: Date;

  @Column()
  month: number;

  @Column()
  year: number;

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

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Installment, (installment) => installment.transaction)
  installments: Installment[];
}
