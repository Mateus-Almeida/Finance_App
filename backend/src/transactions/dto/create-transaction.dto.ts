import {
  IsString,
  IsNumber,
  IsUUID,
  IsDateString,
  IsBoolean,
  IsOptional,
  Min,
  Max,
} from 'class-validator';

export class CreateTransactionDto {
  @IsUUID()
  categoryId: string;

  @IsString()
  description: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsDateString()
  transactionDate: string;

  @IsNumber()
  @Min(1)
  @Max(12)
  month: number;

  @IsNumber()
  @Min(2000)
  year: number;

  @IsBoolean()
  @IsOptional()
  isFixed?: boolean;

  @IsBoolean()
  @IsOptional()
  isInstallment?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(1)
  totalInstallments?: number;
}
