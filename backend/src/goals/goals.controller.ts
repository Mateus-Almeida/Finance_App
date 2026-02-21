import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GoalsService } from './goals.service';
import { CreateGoalDto, UpdateGoalDto } from './dto/goal.dto';

interface AuthRequest {
  user: {
    userId: string;
    email: string;
    name: string;
  };
}

@Controller('goals')
@UseGuards(JwtAuthGuard)
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Post()
  create(@Body() createGoalDto: CreateGoalDto, @Request() req: AuthRequest) {
    return this.goalsService.create(createGoalDto, req.user.userId);
  }

  @Get()
  findAll(
    @Request() req: AuthRequest,
    @Query('includeInactive') includeInactive: string,
  ) {
    return this.goalsService.findAll(req.user.userId, includeInactive === 'true');
  }

  @Get('progress')
  getProgress(
    @Query('month') month: number,
    @Query('year') year: number,
    @Request() req: AuthRequest,
  ) {
    const today = new Date();
    return this.goalsService.getProgress(
      req.user.userId,
      month || today.getMonth() + 1,
      year || today.getFullYear(),
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: AuthRequest) {
    return this.goalsService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateGoalDto: UpdateGoalDto,
    @Request() req: AuthRequest,
  ) {
    return this.goalsService.update(id, updateGoalDto, req.user.userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: AuthRequest) {
    return this.goalsService.remove(id, req.user.userId);
  }
}
