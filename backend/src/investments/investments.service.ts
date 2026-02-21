import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InvestmentAsset, InvestmentType } from './entities/investment-asset.entity';
import { InvestmentMovement, MovementType } from './entities/investment-movement.entity';
import { CreateInvestmentAssetDto, UpdateInvestmentAssetDto, CreateInvestmentMovementDto } from './dto/investment.dto';

export interface InvestmentSummary {
  totalInvested: number;
  totalCurrentValue: number;
  totalYield: number;
  yieldPercent: number;
  monthlyContribution: number;
}

export interface NetWorthData {
  savingsBoxesTotal: number;
  investmentsTotal: number;
  assetsTotal: number;
  netWorth: number;
}

@Injectable()
export class InvestmentsService {
  constructor(
    @InjectRepository(InvestmentAsset)
    private assetRepository: Repository<InvestmentAsset>,
    @InjectRepository(InvestmentMovement)
    private movementRepository: Repository<InvestmentMovement>,
  ) {}

  async createAsset(dto: CreateInvestmentAssetDto, userId: string): Promise<InvestmentAsset> {
    const asset = this.assetRepository.create({
      ...dto,
      userId,
      currentValue: dto.initialValue,
    });
    return this.assetRepository.save(asset);
  }

  async findAllAssets(userId: string, includeInactive: boolean = false): Promise<InvestmentAsset[]> {
    const where: any = { userId };
    if (!includeInactive) {
      where.active = true;
    }
    return this.assetRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async findAssetById(id: string, userId: string): Promise<InvestmentAsset> {
    const asset = await this.assetRepository.findOne({ where: { id, userId } });
    if (!asset) throw new NotFoundException('Ativo não encontrado');
    return asset;
  }

  async updateAsset(id: string, dto: UpdateInvestmentAssetDto, userId: string): Promise<InvestmentAsset> {
    const asset = await this.findAssetById(id, userId);
    Object.assign(asset, dto);
    return this.assetRepository.save(asset);
  }

  async deleteAsset(id: string, userId: string): Promise<void> {
    const asset = await this.findAssetById(id, userId);
    await this.assetRepository.remove(asset);
  }

  async createMovement(dto: CreateInvestmentMovementDto, userId: string): Promise<InvestmentMovement> {
    const asset = await this.findAssetById(dto.assetId, userId);

    const movement = this.movementRepository.create({
      ...dto,
      userId,
      movementDate: new Date(dto.movementDate),
    });

    await this.movementRepository.save(movement);

    if (dto.type === MovementType.CONTRIBUTION) {
      asset.currentValue = parseFloat((asset.currentValue + dto.amount).toFixed(2));
    } else if (dto.type === MovementType.WITHDRAWAL) {
      if (asset.currentValue < dto.amount) {
        throw new BadRequestException('Saldo insuficiente para retirada');
      }
      asset.currentValue = parseFloat((asset.currentValue - dto.amount).toFixed(2));
    } else if (dto.type === MovementType.YIELD) {
      asset.currentValue = parseFloat((asset.currentValue + dto.amount).toFixed(2));
    } else if (dto.type === MovementType.LOSS) {
      asset.currentValue = parseFloat((asset.currentValue - dto.amount).toFixed(2));
    }

    await this.assetRepository.save(asset);

    const savedMovement = await this.movementRepository.save(movement);
    return savedMovement;
  }

  async getMovements(userId: string, assetId?: string): Promise<InvestmentMovement[]> {
    const where: any = { userId };
    if (assetId) where.assetId = assetId;
    return this.movementRepository.find({ where, order: { movementDate: 'DESC' } });
  }

  async getSummary(userId: string): Promise<InvestmentSummary> {
    const assets = await this.findAllAssets(userId, true);
    
    const totalInvested = assets.reduce((sum, a) => sum + Number(a.initialValue), 0);
    const totalCurrentValue = assets.reduce((sum, a) => sum + Number(a.currentValue), 0);
    const monthlyContribution = assets.reduce((sum, a) => sum + Number(a.monthlyContribution || 0), 0);
    const totalYield = totalCurrentValue - totalInvested;
    const yieldPercent = totalInvested > 0 ? (totalYield / totalInvested) * 100 : 0;

    return {
      totalInvested,
      totalCurrentValue,
      totalYield,
      yieldPercent,
      monthlyContribution,
    };
  }

  async getNetWorth(userId: string, month: number, year: number): Promise<NetWorthData> {
    const savingsBoxesTotal = await this.assetRepository.query(
      `SELECT COALESCE(SUM(balance), 0) as total FROM savings_boxes WHERE user_id = $1`,
      [userId]
    );

    const investmentsTotal = await this.assetRepository.query(
      `SELECT COALESCE(SUM(current_value), 0) as total FROM investment_assets WHERE user_id = $1 AND active = true`,
      [userId]
    );

    const savingsTotal = parseFloat(savingsBoxesTotal[0]?.total || '0');
    const assetsTotal = parseFloat(investmentsTotal[0]?.total || '0');

    return {
      savingsBoxesTotal: savingsTotal,
      investmentsTotal: assetsTotal,
      assetsTotal: assetsTotal + savingsTotal,
      netWorth: savingsTotal + assetsTotal,
    };
  }

  async getEvolution(userId: string, months: number = 12) {
    const result = [];
    const today = new Date();
    let currentMonth = today.getMonth() + 1;
    let currentYear = today.getFullYear();

    const monthNames = [
      'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
    ];

    for (let i = 0; i < months; i++) {
      const netWorth = await this.getNetWorth(userId, currentMonth, currentYear);
      
      result.push({
        month: currentMonth,
        year: currentYear,
        monthName: monthNames[currentMonth - 1],
        netWorth: netWorth.netWorth,
        savingsBoxes: netWorth.savingsBoxesTotal,
        investments: netWorth.investmentsTotal,
      });

      currentMonth--;
      if (currentMonth < 1) {
        currentMonth = 12;
        currentYear--;
      }
    }

    return result.reverse();
  }
}
