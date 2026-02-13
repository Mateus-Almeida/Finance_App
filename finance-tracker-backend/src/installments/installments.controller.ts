import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { InstallmentsService } from './installments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('installments')
@UseGuards(JwtAuthGuard)
export class InstallmentsController {
  constructor(private readonly installmentsService: InstallmentsService) {}

  @Get()
  findAll(
    @Query('month') month: number,
    @Query('year') year: number,
    @Request() req,
  ) {
    return this.installmentsService.findAll(req.user.userId, month, year);
  }

  @Get('pending')
  findPending(
    @Query('month') month: number,
    @Query('year') year: number,
    @Request() req,
  ) {
    return this.installmentsService.findPending(req.user.userId, month, year);
  }

  @Get('upcoming')
  getUpcoming(@Query('limit') limit: number, @Request() req) {
    return this.installmentsService.getUpcomingInstallments(
      req.user.userId,
      limit || 5,
    );
  }

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

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.installmentsService.findOne(id, req.user.userId);
  }

  @Patch(':id/pay')
  markAsPaid(@Param('id') id: string, @Request() req) {
    return this.installmentsService.markAsPaid(id, req.user.userId);
  }

  @Patch(':id/unpay')
  markAsUnpaid(@Param('id') id: string, @Request() req) {
    return this.installmentsService.markAsUnpaid(id, req.user.userId);
  }
}
