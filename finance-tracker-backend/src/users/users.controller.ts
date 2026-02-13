import { Controller, Get, Body, Patch, Delete, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getProfile(@Request() req) {
    return this.usersService.findById(req.user.userId);
  }

  @Patch('me')
  updateProfile(@Body() updateUserDto: UpdateUserDto, @Request() req) {
    return this.usersService.update(req.user.userId, updateUserDto);
  }

  @Delete('me')
  deleteProfile(@Request() req) {
    return this.usersService.remove(req.user.userId);
  }
}
