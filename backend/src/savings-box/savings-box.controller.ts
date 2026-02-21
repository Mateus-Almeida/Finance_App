import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SavingsBoxService } from './savings-box.service';
import {
  CreateSavingsBoxDto,
  UpdateSavingsBoxDto,
  DepositToSavingsBoxDto,
  WithdrawFromSavingsBoxDto,
} from './dto/savings-box.dto';

interface AuthRequest {
  user: {
    id: string;
    email: string;
    name: string;
  };
}

@Controller('savings-boxes')
@UseGuards(JwtAuthGuard)
export class SavingsBoxController {
  constructor(private readonly savingsBoxService: SavingsBoxService) {}

  @Post()
  create(@Body() createSavingsBoxDto: CreateSavingsBoxDto, @Request() req: AuthRequest) {
    return this.savingsBoxService.create(createSavingsBoxDto, req.user.id);
  }

  @Get()
  findAll(@Request() req: AuthRequest) {
    return this.savingsBoxService.findAll(req.user.id);
  }

  @Get('total')
  getTotal(@Request() req: AuthRequest) {
    return this.savingsBoxService.getTotalSavings(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: AuthRequest) {
    return this.savingsBoxService.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSavingsBoxDto: UpdateSavingsBoxDto,
    @Request() req: AuthRequest,
  ) {
    return this.savingsBoxService.update(id, updateSavingsBoxDto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: AuthRequest) {
    return this.savingsBoxService.remove(id, req.user.id);
  }

  @Post('deposit')
  deposit(@Body() dto: DepositToSavingsBoxDto, @Request() req: AuthRequest) {
    return this.savingsBoxService.deposit(dto, req.user.id);
  }

  @Post('withdraw')
  withdraw(@Body() dto: WithdrawFromSavingsBoxDto, @Request() req: AuthRequest) {
    return this.savingsBoxService.withdraw(dto, req.user.id);
  }
}
