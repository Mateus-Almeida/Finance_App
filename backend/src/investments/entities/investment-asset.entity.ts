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
import { InvestmentMovement } from './investment-movement.entity';

export enum InvestmentType {
  CDB = 'CDB',
  STOCK = 'STOCK',
  CRYPTO = 'CRYPTO',
  TREASURY = 'TREASURY',
  FUND = 'FUND',
  OTHER = 'OTHER',
}

@Entity('investment_assets')
export class InvestmentAsset {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, (user) => user.investmentAssets, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: InvestmentType,
    default: InvestmentType.OTHER,
  })
  type: InvestmentType;

  @Column({ nullable: true })
  institution: string;

  @Column({ name: 'initial_value', type: 'decimal', precision: 15, scale: 2 })
  initialValue: number;

  @Column({ name: 'current_value', type: 'decimal', precision: 15, scale: 2 })
  currentValue: number;

  @Column({ name: 'monthly_contribution', type: 'decimal', precision: 15, scale: 2, nullable: true })
  monthlyContribution: number;

  @Column({ default: true })
  active: boolean;

  @Column({ nullable: true })
  color: string;

  @Column({ nullable: true })
  icon: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => InvestmentMovement, (movement) => movement.asset)
  movements: InvestmentMovement[];
}
