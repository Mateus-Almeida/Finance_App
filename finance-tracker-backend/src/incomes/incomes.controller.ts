import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { IncomesService } from './incomes.service';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('incomes')
@UseGuards(JwtAuthGuard)
export class IncomesController {
  constructor(private readonly incomesService: IncomesService) {}

  @Post()
  create(@Body() createIncomeDto: CreateIncomeDto, @Request() req) {
    return this.incomesService.create(createIncomeDto, req.user.userId);
  }

  @Get()
  findAll(@Query('month') month: number, @Query('year') year: number, @Request() req) {
    return this.incomesService.findAll(req.user.userId, month, year);
  }

  @Get('total')
  async getTotal(@Query('month') month: number, @Query('year') year: number, @Request() req) {
    const total = await this.incomesService.getTotalIncome(req.user.userId, month, year);
    return { total };
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.incomesService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateIncomeDto: UpdateIncomeDto, @Request() req) {
    return this.incomesService.update(id, updateIncomeDto, req.user.userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.incomesService.remove(id, req.user.userId);
  }
}
