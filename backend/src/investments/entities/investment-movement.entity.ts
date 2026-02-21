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
import { InvestmentAsset } from './investment-asset.entity';

export enum MovementType {
  CONTRIBUTION = 'CONTRIBUTION',
  WITHDRAWAL = 'WITHDRAWAL',
  YIELD = 'YIELD',
  LOSS = 'LOSS',
}

@Entity('investment_movements')
export class InvestmentMovement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, (user) => user.investmentMovements, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'asset_id' })
  assetId: string;

  @ManyToOne(() => InvestmentAsset, (asset) => asset.movements, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'asset_id' })
  asset: InvestmentAsset;

  @Column({
    type: 'enum',
    enum: MovementType,
    default: MovementType.CONTRIBUTION,
  })
  type: MovementType;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ nullable: true })
  description: string;

  @Column({ name: 'movement_date', type: 'date' })
  movementDate: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
