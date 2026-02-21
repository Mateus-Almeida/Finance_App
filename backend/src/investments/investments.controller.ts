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
import { InvestmentsService } from './investments.service';
import { CreateInvestmentAssetDto, UpdateInvestmentAssetDto, CreateInvestmentMovementDto } from './dto/investment.dto';

interface AuthRequest {
  user: { userId: string; email: string; name: string };
}

@Controller('investments')
@UseGuards(JwtAuthGuard)
export class InvestmentsController {
  constructor(private readonly investmentsService: InvestmentsService) {}

  @Post('assets')
  createAsset(@Body() dto: CreateInvestmentAssetDto, @Request() req: AuthRequest) {
    return this.investmentsService.createAsset(dto, req.user.userId);
  }

  @Get('assets')
  findAllAssets(
    @Request() req: AuthRequest,
    @Query('includeInactive') includeInactive: string,
  ) {
    return this.investmentsService.findAllAssets(req.user.userId, includeInactive === 'true');
  }

  @Get('assets/:id')
  findAssetById(@Param('id') id: string, @Request() req: AuthRequest) {
    return this.investmentsService.findAssetById(id, req.user.userId);
  }

  @Patch('assets/:id')
  updateAsset(
    @Param('id') id: string,
    @Body() dto: UpdateInvestmentAssetDto,
    @Request() req: AuthRequest,
  ) {
    return this.investmentsService.updateAsset(id, dto, req.user.userId);
  }

  @Delete('assets/:id')
  deleteAsset(@Param('id') id: string, @Request() req: AuthRequest) {
    return this.investmentsService.deleteAsset(id, req.user.userId);
  }

  @Post('movements')
  createMovement(@Body() dto: CreateInvestmentMovementDto, @Request() req: AuthRequest) {
    return this.investmentsService.createMovement(dto, req.user.userId);
  }

  @Get('movements')
  getMovements(
    @Request() req: AuthRequest,
    @Query('assetId') assetId: string,
  ) {
    return this.investmentsService.getMovements(req.user.userId, assetId);
  }

  @Get('summary')
  getSummary(@Request() req: AuthRequest) {
    return this.investmentsService.getSummary(req.user.userId);
  }

  @Get('net-worth')
  getNetWorth(
    @Query('month') month: number,
    @Query('year') year: number,
    @Request() req: AuthRequest,
  ) {
    const today = new Date();
    return this.investmentsService.getNetWorth(
      req.user.userId,
      month || today.getMonth() + 1,
      year || today.getFullYear(),
    );
  }

  @Get('evolution')
  getEvolution(
    @Query('months') months: number,
    @Request() req: AuthRequest,
  ) {
    return this.investmentsService.getEvolution(req.user.userId, months || 12);
  }
}
