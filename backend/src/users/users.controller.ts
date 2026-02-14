import { Controller, Get, Body, Patch, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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
