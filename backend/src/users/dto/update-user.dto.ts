import { IsString, IsOptional, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({
    description: 'Nome completo para atualização',
    example: 'Maria Oliveira',
    required: false,
  })
  @IsString()
  @MinLength(2)
  @IsOptional()
  name?: string;
}
