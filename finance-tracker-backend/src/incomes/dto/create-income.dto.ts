import { IsString, IsNumber, IsBoolean, IsOptional, Min, Max } from 'class-validator';

export class CreateIncomeDto {
  @IsString()
  description: string;

  @IsNumber()
  @Min(0)
  amount: number;

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
}
