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
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  create(@Body() createTransactionDto: CreateTransactionDto, @Request() req) {
    return this.transactionsService.create(createTransactionDto, req.user.userId);
  }

  @Get()
  findAll(@Query('month') month: number, @Query('year') year: number, @Request() req) {
    return this.transactionsService.findAll(req.user.userId, month, year);
  }

  @Get('summary')
  getSummary(@Query('month') month: number, @Query('year') year: number, @Request() req) {
    return this.transactionsService.getMonthlySummary(req.user.userId, month, year);
  }

  @Get('projection')
  getProjection(@Query('months') months: number, @Request() req) {
    return this.transactionsService.getProjection(req.user.userId, months || 6);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.transactionsService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
    @Request() req,
  ) {
    return this.transactionsService.update(id, updateTransactionDto, req.user.userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.transactionsService.remove(id, req.user.userId);
  }
}
