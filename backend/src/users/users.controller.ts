import { Controller, Get, Body, Patch, Delete, UseGuards, Request, Post, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Listar todos os usuários (apenas admin)' })
  @ApiOkResponse({ description: 'Retorna lista de usuários' })
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @ApiOperation({ summary: 'Criar novo usuário (apenas admin)' })
  @ApiBody({ type: CreateUserDto })
  @ApiOkResponse({ description: 'Usuário criado com sucesso' })
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @ApiOperation({ summary: 'Atualizar usuário por ID (apenas admin)' })
  @ApiBody({ type: UpdateUserDto })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @ApiOperation({ summary: 'Excluir usuário por ID (apenas admin)' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @ApiOperation({ summary: 'Obter perfil do usuário autenticado' })
  @ApiOkResponse({ description: 'Retorna dados do usuário' })
  @Get('me')
  getProfile(@Request() req) {
    return this.usersService.findById(req.user.userId);
  }

  @ApiOperation({ summary: 'Atualizar perfil do usuário' })
  @ApiBody({ type: UpdateUserDto })
  @Patch('me')
  updateProfile(@Body() updateUserDto: UpdateUserDto, @Request() req) {
    return this.usersService.update(req.user.userId, updateUserDto);
  }

  @ApiOperation({ summary: 'Excluir conta do usuário' })
  @Delete('me')
  deleteProfile(@Request() req) {
    return this.usersService.remove(req.user.userId);
  }
}
