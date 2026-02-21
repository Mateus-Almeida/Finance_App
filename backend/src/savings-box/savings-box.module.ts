import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SavingsBoxService } from './savings-box.service';
import { SavingsBoxController } from './savings-box.controller';
import { SavingsBox } from './entities/savings-box.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SavingsBox])],
  controllers: [SavingsBoxController],
  providers: [SavingsBoxService],
  exports: [SavingsBoxService],
})
export class SavingsBoxModule {}
