import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CategoryType } from '../entities/category.entity';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Nome da categoria',
    example: 'Alimentação',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Tipo da categoria',
    enum: CategoryType,
    example: CategoryType.ESSENTIAL,
  })
  @IsEnum(CategoryType)
  type: CategoryType;

  @ApiProperty({
    description: 'Cor hexadecimal usada na UI',
    example: '#FF5733',
    required: false,
  })
  @IsString()
  @IsOptional()
  color?: string;

  @ApiProperty({
    description: 'Icone representativo',
    example: 'mdi-food',
    required: false,
  })
  @IsString()
  @IsOptional()
  icon?: string;
}
