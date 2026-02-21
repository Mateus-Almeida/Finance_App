import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsUUID,
  IsDateString,
  IsBoolean,
  IsOptional,
  IsEnum,
  Min,
  Max,
} from 'class-validator';
import { TransactionType } from '../../categories/entities/category.entity';

export class CreateTransactionDto {
  @ApiProperty()
  @IsUUID()
  categoryId: string;

  @ApiProperty({ enum: TransactionType })
  @IsEnum(TransactionType)
  type: TransactionType;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty()
  @IsDateString()
  transactionDate: string;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  @Max(12)
  competenceMonth: number;

  @ApiProperty()
  @IsNumber()
  @Min(2000)
  competenceYear: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isFixed?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isInstallment?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  totalInstallments?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  repeatMonthly?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(2)
  repeatMonths?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPaid?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  savingsBoxId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  creditCardId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  paymentMethodId?: string;
}

export class UpdateTransactionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({ enum: TransactionType })
  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  transactionDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(12)
  competenceMonth?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(2000)
  competenceYear?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isFixed?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isInstallment?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  totalInstallments?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  repeatMonthly?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(2)
  repeatMonths?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPaid?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  savingsBoxId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  creditCardId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  paymentMethodId?: string;
}
