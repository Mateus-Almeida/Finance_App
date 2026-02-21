import { IsString, IsNumber, IsOptional, IsBoolean, IsEnum, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InvestmentType } from '../entities/investment-asset.entity';
import { MovementType } from '../entities/investment-movement.entity';

export class CreateInvestmentAssetDto {
  @ApiProperty({ example: 'Tesouro Direto 2029' })
  @IsString()
  name: string;

  @ApiProperty({ enum: InvestmentType, example: InvestmentType.TREASURY })
  @IsEnum(InvestmentType)
  type: InvestmentType;

  @ApiPropertyOptional({ example: 'NuInvest' })
  @IsOptional()
  @IsString()
  institution?: string;

  @ApiProperty({ example: 10000 })
  @IsNumber()
  @Min(0)
  initialValue: number;

  @ApiPropertyOptional({ example: 500 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  monthlyContribution?: number;

  @ApiPropertyOptional({ example: '#10b981' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ example: 'mdi-chart-line' })
  @IsOptional()
  @IsString()
  icon?: string;
}

export class UpdateInvestmentAssetDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ enum: InvestmentType })
  @IsOptional()
  @IsEnum(InvestmentType)
  type?: InvestmentType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  institution?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  currentValue?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  monthlyContribution?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  icon?: string;
}

export class CreateInvestmentMovementDto {
  @ApiProperty()
  @IsString()
  assetId: string;

  @ApiProperty({ enum: MovementType, example: MovementType.CONTRIBUTION })
  @IsEnum(MovementType)
  type: MovementType;

  @ApiProperty()
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsString()
  movementDate: string;
}
