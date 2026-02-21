import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum GoalType {
  CATEGORY_LIMIT = 'CATEGORY_LIMIT',
  CARD_LIMIT = 'CARD_LIMIT',
  SAVING = 'SAVING',
  TARGET_VALUE = 'TARGET_VALUE',
}

export enum GoalStatus {
  OK = 'OK',
  WARNING = 'WARNING',
  EXCEEDED = 'EXCEEDED',
  NOT_STARTED = 'NOT_STARTED',
}

@Entity('goals')
export class Goal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, (user) => user.goals, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: GoalType,
    default: GoalType.CATEGORY_LIMIT,
  })
  type: GoalType;

  @Column({ default: true })
  active: boolean;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  targetValue: number;

  @Column({ name: 'category_id', nullable: true })
  categoryId: string;

  @Column({ name: 'payment_method_id', nullable: true })
  paymentMethodId: string;

  @Column({ name: 'savings_box_id', nullable: true })
  savingsBoxId: string;

  @Column({ name: 'warning_percent', default: 80 })
  warningPercent: number;

  @Column({ nullable: true })
  color: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
