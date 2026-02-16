import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @ApiProperty({
    description: 'Email do usuário',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Senha do usuário, mínimo 6 caracteres',
    example: 'minhaSenha123',
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: 'Nome completo do usuário',
    example: 'João Silva',
  })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({
    description: 'Papel do usuário (ADMIN ou NORMAL)',
    enum: UserRole,
    required: false,
    example: 'NORMAL',
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
