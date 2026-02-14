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
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { IncomesService } from './incomes.service';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Incomes')
@ApiBearerAuth('JWT-auth')
@Controller('incomes')
@UseGuards(JwtAuthGuard)
export class IncomesController {
  constructor(private readonly incomesService: IncomesService) {}

  @ApiOperation({ summary: 'Criar nova renda' })
  @ApiBody({ type: CreateIncomeDto })
  @ApiOkResponse({ description: 'Renda criada' })
  @Post()
  create(@Body() createIncomeDto: CreateIncomeDto, @Request() req) {
    return this.incomesService.create(createIncomeDto, req.user.userId);
  }

  @ApiOperation({ summary: 'Listar rendas com filtros por mês e ano' })
  @ApiQuery({ name: 'month', required: false, description: 'Mês filtrado' })
  @ApiQuery({ name: 'year', required: false, description: 'Ano filtrado' })
  @Get()
  findAll(@Query('month') month: number, @Query('year') year: number, @Request() req) {
    return this.incomesService.findAll(req.user.userId, month, year);
  }

  @ApiOperation({ summary: 'Obter total de rendas por período' })
  @ApiQuery({ name: 'month', required: false, description: 'Mês filtrado' })
  @ApiQuery({ name: 'year', required: false, description: 'Ano filtrado' })
  @Get('total')
  async getTotal(@Query('month') month: number, @Query('year') year: number, @Request() req) {
    const total = await this.incomesService.getTotalIncome(req.user.userId, month, year);
    return { total };
  }

  @ApiOperation({ summary: 'Buscar renda por ID' })
  @ApiParam({ name: 'id', description: 'ID da renda' })
  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.incomesService.findOne(id, req.user.userId);
  }

  @ApiOperation({ summary: 'Atualizar renda' })
  @ApiParam({ name: 'id', description: 'ID da renda' })
  @ApiBody({ type: UpdateIncomeDto })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateIncomeDto: UpdateIncomeDto, @Request() req) {
    return this.incomesService.update(id, updateIncomeDto, req.user.userId);
  }

  @ApiOperation({ summary: 'Remover renda' })
  @ApiParam({ name: 'id', description: 'ID da renda' })
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.incomesService.remove(id, req.user.userId);
  }
}
