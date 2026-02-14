import { IsString, IsNumber, IsBoolean, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateIncomeDto {
  @ApiProperty({
    description: 'Descrição da renda',
    example: 'Salário',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Valor recebido',
    example: 4500,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({
    description: 'Mês de competência',
    example: 1,
    minimum: 1,
    maximum: 12,
  })
  @IsNumber()
  @Min(1)
  @Max(12)
  month: number;

  @ApiProperty({
    description: 'Ano de competência',
    example: 2024,
    minimum: 2000,
  })
  @IsNumber()
  @Min(2000)
  year: number;

  @ApiProperty({
    description: 'Indica se a renda é fixa',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isFixed?: boolean;
}
