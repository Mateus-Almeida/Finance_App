import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { InstallmentsService } from './installments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Installments')
@ApiBearerAuth('JWT-auth')
@Controller('installments')
@UseGuards(JwtAuthGuard)
export class InstallmentsController {
  constructor(private readonly installmentsService: InstallmentsService) {}

  @ApiOperation({ summary: 'Listar parcelas com filtros mensais' })
  @ApiQuery({ name: 'month', required: false, description: 'Mês filtrado' })
  @ApiQuery({ name: 'year', required: false, description: 'Ano filtrado' })
  @Get()
  findAll(
    @Query('month') month: number,
    @Query('year') year: number,
    @Request() req,
  ) {
    return this.installmentsService.findAll(req.user.userId, month, year);
  }

  @ApiOperation({ summary: 'Listar parcelas pendentes' })
  @ApiQuery({ name: 'month', required: false })
  @ApiQuery({ name: 'year', required: false })
  @Get('pending')
  findPending(
    @Query('month') month: number,
    @Query('year') year: number,
    @Request() req,
  ) {
    return this.installmentsService.findPending(req.user.userId, month, year);
  }

  @ApiOperation({ summary: 'Listar próximas parcelas' })
  @ApiQuery({ name: 'limit', required: false, description: 'Quantidade de parcelas retornadas' })
  @Get('upcoming')
  getUpcoming(@Query('limit') limit: number, @Request() req) {
    return this.installmentsService.getUpcomingInstallments(
      req.user.userId,
      limit || 5,
    );
  }

  @ApiOperation({ summary: 'Obter total pendente' })
  @ApiQuery({ name: 'month', required: false })
  @ApiQuery({ name: 'year', required: false })
  @Get('total-pending')
  async getTotalPending(
    @Query('month') month: number,
    @Query('year') year: number,
    @Request() req,
  ) {
    const total = await this.installmentsService.getTotalPending(
      req.user.userId,
      month,
      year,
    );
    return { total };
  }

  @ApiOperation({ summary: 'Buscar parcela por ID' })
  @ApiParam({ name: 'id', description: 'ID da parcela' })
  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.installmentsService.findOne(id, req.user.userId);
  }

  @ApiOperation({ summary: 'Marcar parcela como paga' })
  @ApiParam({ name: 'id', description: 'ID da parcela' })
  @Patch(':id/pay')
  markAsPaid(@Param('id') id: string, @Request() req) {
    return this.installmentsService.markAsPaid(id, req.user.userId);
  }

  @ApiOperation({ summary: 'Desmarcar pagamento da parcela' })
  @ApiParam({ name: 'id', description: 'ID da parcela' })
  @Patch(':id/unpay')
  markAsUnpaid(@Param('id') id: string, @Request() req) {
    return this.installmentsService.markAsUnpaid(id, req.user.userId);
  }
}
