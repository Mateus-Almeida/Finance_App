import { Controller, Get, Param, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CardsService } from './cards.service';

interface AuthRequest {
  user: {
    userId: string;
    email: string;
    name: string;
  };
}

@Controller('cards')
@UseGuards(JwtAuthGuard)
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Get('summary')
  getSummary(
    @Query('month') month: number,
    @Query('year') year: number,
    @Request() req: AuthRequest,
  ) {
    const today = new Date();
    return this.cardsService.getCardsSummary(
      req.user.userId,
      month || today.getMonth() + 1,
      year || today.getFullYear(),
    );
  }

  @Get(':id/timeline')
  getTimeline(
    @Param('id') id: string,
    @Query('months') months: number,
    @Request() req: AuthRequest,
  ) {
    return this.cardsService.getCardTimeline(req.user.userId, id, months || 6);
  }

  @Get(':id/transactions')
  getTransactions(
    @Param('id') id: string,
    @Query('invoice_month') invoiceMonth: number,
    @Query('invoice_year') invoiceYear: number,
    @Request() req: AuthRequest,
  ) {
    const today = new Date();
    return this.cardsService.getCardTransactions(
      req.user.userId,
      id,
      invoiceMonth || today.getMonth() + 1,
      invoiceYear || today.getFullYear(),
    );
  }
}
