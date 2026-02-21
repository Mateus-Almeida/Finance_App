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
import { PaymentMethodService } from './payment-method.service';
import { CreatePaymentMethodDto, UpdatePaymentMethodDto } from './dto/payment-method.dto';

interface AuthRequest {
  user: {
    userId: string;
    email: string;
    name: string;
  };
}

@Controller('payment-methods')
@UseGuards(JwtAuthGuard)
export class PaymentMethodController {
  constructor(private readonly paymentMethodService: PaymentMethodService) {}

  @Post()
  create(
    @Body() createPaymentMethodDto: CreatePaymentMethodDto,
    @Request() req: AuthRequest,
  ) {
    return this.paymentMethodService.create(createPaymentMethodDto, req.user.userId);
  }

  @Get()
  findAll(
    @Request() req: AuthRequest,
    @Query('includeInactive') includeInactive: string,
  ) {
    return this.paymentMethodService.findAll(
      req.user.userId,
      includeInactive === 'true',
    );
  }

  @Get('type/:type')
  findByType(@Param('type') type: string, @Request() req: AuthRequest) {
    return this.paymentMethodService.getByType(req.user.userId, type as any);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: AuthRequest) {
    return this.paymentMethodService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePaymentMethodDto: UpdatePaymentMethodDto,
    @Request() req: AuthRequest,
  ) {
    return this.paymentMethodService.update(id, updatePaymentMethodDto, req.user.userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: AuthRequest) {
    return this.paymentMethodService.remove(id, req.user.userId);
  }

  @Patch(':id/deactivate')
  deactivate(@Param('id') id: string, @Request() req: AuthRequest) {
    return this.paymentMethodService.deactivate(id, req.user.userId);
  }

  @Patch(':id/activate')
  activate(@Param('id') id: string, @Request() req: AuthRequest) {
    return this.paymentMethodService.activate(id, req.user.userId);
  }
}
