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
import { ApiProperty } from '@nestjs/swagger';

export class CreateTransactionDto {
  @ApiProperty({
    description: 'ID da categoria relacionada',
    example: '3f0f8d9e-9a3b-4fe5-8e55-1cb9d2f50b4c',
    format: 'uuid',
  })
  @IsUUID()
  categoryId: string;

  @ApiProperty({
    description: 'Descrição da transação',
    example: 'Supermercado',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Valor da transação',
    example: 250.75,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({
    description: 'Data da transação',
    example: '2024-01-15',
    format: 'date-time',
  })
  @IsDateString()
  transactionDate: string;

  @ApiProperty({
    description: 'Mês da transação',
    example: 1,
    minimum: 1,
    maximum: 12,
  })
  @IsNumber()
  @Min(1)
  @Max(12)
  month: number;

  @ApiProperty({
    description: 'Ano da transação',
    example: 2024,
    minimum: 2000,
  })
  @IsNumber()
  @Min(2000)
  year: number;

  @ApiProperty({
    description: 'Indica se a transação é fixa',
    required: false,
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  isFixed?: boolean;

  @ApiProperty({
    description: 'Indica se a transação é parcelada',
    required: false,
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isInstallment?: boolean;

  @ApiProperty({
    description: 'Total de parcelas quando parcelada',
    required: false,
    example: 12,
    minimum: 1,
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  totalInstallments?: number;

  @ApiProperty({
    description: 'Indica se a transação deve se repetir mensalmente',
    required: false,
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  repeatMonthly?: boolean;

  @ApiProperty({
    description: 'Quantos meses repetir quando repeatMonthly é true',
    required: false,
    example: 5,
    minimum: 2,
  })
  @IsNumber()
  @IsOptional()
  @Min(2)
  repeatMonths?: number;
}
