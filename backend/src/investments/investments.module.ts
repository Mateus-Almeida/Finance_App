import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvestmentsController } from './investments.controller';
import { InvestmentsService } from './investments.service';
import { InvestmentAsset } from './entities/investment-asset.entity';
import { InvestmentMovement } from './entities/investment-movement.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InvestmentAsset, InvestmentMovement])],
  controllers: [InvestmentsController],
  providers: [InvestmentsService],
  exports: [InvestmentsService],
})
export class InvestmentsModule {}
