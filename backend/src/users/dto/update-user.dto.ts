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

  @ApiProperty({
    description: 'Email para atualização',
    example: 'maria@exemplo.com',
    required: false,
  })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'Senha para atualização',
    example: 'nova senha',
    required: false,
  })
  @IsString()
  @MinLength(6)
  @IsOptional()
  password?: string;

  @ApiProperty({
    description: 'Tipo de usuário',
    example: 'ADMIN',
    required: false,
  })
  @IsString()
  @IsOptional()
  role?: string;
}
