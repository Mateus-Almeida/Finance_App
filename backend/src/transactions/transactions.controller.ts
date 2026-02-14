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
  Logger,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Transactions')
@ApiBearerAuth('JWT-auth')
@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  private readonly logger = new Logger(TransactionsController.name);

  constructor(private readonly transactionsService: TransactionsService) {}

  @ApiOperation({ summary: 'Criar nova transação' })
  @ApiBody({ type: CreateTransactionDto })
  @ApiOkResponse({ description: 'Transação criada' })
  @Post()
  async create(@Body() createTransactionDto: CreateTransactionDto, @Request() req) {
    try {
      this.logger.log('Received data:', createTransactionDto);
      return await this.transactionsService.create(createTransactionDto, req.user.userId);
    } catch (error) {
      this.logger.error('Error creating transaction:', error);
      throw error;
    }
  }

  @ApiOperation({ summary: 'Listar transações por mês e ano' })
  @ApiQuery({ name: 'month', required: false, description: 'Mês filtrado' })
  @ApiQuery({ name: 'year', required: false, description: 'Ano filtrado' })
  @Get()
  findAll(@Query('month') month: number, @Query('year') year: number, @Request() req) {
    return this.transactionsService.findAll(req.user.userId, month, year);
  }

  @ApiOperation({ summary: 'Resumo mensal das transações' })
  @ApiQuery({ name: 'month', required: false })
  @ApiQuery({ name: 'year', required: false })
  @Get('summary')
  getSummary(@Query('month') month: number, @Query('year') year: number, @Request() req) {
    return this.transactionsService.getMonthlySummary(req.user.userId, month, year);
  }

  @ApiOperation({ summary: 'Projeção de gastos para próximos meses' })
  @ApiQuery({ name: 'months', required: false, description: 'Número de meses' })
  @Get('projection')
  getProjection(@Query('months') months: number, @Request() req) {
    return this.transactionsService.getProjection(req.user.userId, months || 6);
  }

  @ApiOperation({ summary: 'Totais por categoria' })
  @ApiQuery({ name: 'month', required: false, description: 'Mês filtrado' })
  @ApiQuery({ name: 'year', required: false, description: 'Ano filtrado' })
  @Get('by-category')
  getByCategory(
    @Query('month') month: number,
    @Query('year') year: number,
    @Request() req,
  ) {
    return this.transactionsService.getByCategory(req.user.userId, month, year);
  }

  @ApiOperation({ summary: 'Buscar transação por ID' })
  @ApiParam({ name: 'id', description: 'ID da transação' })
  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.transactionsService.findOne(id, req.user.userId);
  }

  @ApiOperation({ summary: 'Atualizar transação' })
  @ApiParam({ name: 'id', description: 'ID da transação' })
  @ApiBody({ type: UpdateTransactionDto })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
    @Request() req,
  ) {
    return this.transactionsService.update(id, updateTransactionDto, req.user.userId);
  }

  @ApiOperation({ summary: 'Remover transação' })
  @ApiParam({ name: 'id', description: 'ID da transação' })
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.transactionsService.remove(id, req.user.userId);
  }
}
