import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsUUID, IsDateString, IsBoolean, IsOptional, Min, Max } from 'class-validator';

export class UpdateTransactionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  categoryId?: string;

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
  month?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(2000)
  year?: number;

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
}
