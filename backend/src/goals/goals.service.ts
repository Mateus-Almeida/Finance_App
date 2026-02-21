import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Goal, GoalType, GoalStatus } from './entities/goal.entity';
import { CreateGoalDto, UpdateGoalDto } from './dto/goal.dto';

export interface GoalProgress {
  goalId: string;
  goalName: string;
  goalType: GoalType;
  targetValue: number;
  currentValue: number;
  percentage: number;
  status: GoalStatus;
  color: string;
}

@Injectable()
export class GoalsService {
  constructor(
    @InjectRepository(Goal)
    private goalRepository: Repository<Goal>,
  ) {}

  async create(createGoalDto: CreateGoalDto, userId: string): Promise<Goal> {
    this.validateGoalReferences(createGoalDto);

    const goal = this.goalRepository.create({
      ...createGoalDto,
      userId,
    });

    return this.goalRepository.save(goal);
  }

  async findAll(userId: string, includeInactive: boolean = false): Promise<Goal[]> {
    const where: any = { userId };
    if (!includeInactive) {
      where.active = true;
    }

    return this.goalRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Goal> {
    const goal = await this.goalRepository.findOne({
      where: { id, userId },
    });

    if (!goal) {
      throw new NotFoundException('Meta não encontrada');
    }

    return goal;
  }

  async update(id: string, updateGoalDto: UpdateGoalDto, userId: string): Promise<Goal> {
    const goal = await this.findOne(id, userId);

    if (updateGoalDto.type) {
      this.validateGoalReferences({ ...goal, ...updateGoalDto } as CreateGoalDto);
    }

    Object.assign(goal, updateGoalDto);
    return this.goalRepository.save(goal);
  }

  async remove(id: string, userId: string): Promise<void> {
    const goal = await this.findOne(id, userId);
    await this.goalRepository.remove(goal);
  }

  async getProgress(userId: string, month: number, year: number): Promise<GoalProgress[]> {
    const goals = await this.findAll(userId, true);
    const progress: GoalProgress[] = [];

    for (const goal of goals) {
      const currentValue = await this.calculateCurrentValue(goal, month, year);
      const percentage = goal.targetValue > 0 ? (currentValue / goal.targetValue) * 100 : 0;
      
      let status: GoalStatus;
      if (goal.type === GoalType.SAVING || goal.type === GoalType.TARGET_VALUE) {
        status = percentage >= 100 ? GoalStatus.OK : 
                 percentage >= goal.warningPercent ? GoalStatus.WARNING : GoalStatus.NOT_STARTED;
      } else {
        status = percentage > 100 ? GoalStatus.EXCEEDED :
                 percentage >= goal.warningPercent ? GoalStatus.WARNING : GoalStatus.OK;
      }

      progress.push({
        goalId: goal.id,
        goalName: goal.name,
        goalType: goal.type,
        targetValue: goal.targetValue,
        currentValue,
        percentage,
        status,
        color: goal.color || '#6b7280',
      });
    }

    return progress;
  }

  private async calculateCurrentValue(goal: Goal, month: number, year: number): Promise<number> {
    const query = `
      SELECT COALESCE(SUM(t.amount), 0) as total
      FROM transactions t
      WHERE t.user_id = $1
        AND t.type = 'EXPENSE'
        AND t.competence_month = $2
        AND t.competence_year = $3
    `;

    switch (goal.type) {
      case GoalType.CATEGORY_LIMIT:
        if (!goal.categoryId) return 0;
        const categoryResult = await this.goalRepository.query(
          `${query} AND t.category_id = $4`,
          [goal.userId, month, year, goal.categoryId]
        );
        return parseFloat(categoryResult[0]?.total || '0');

      case GoalType.CARD_LIMIT:
        if (!goal.paymentMethodId) return 0;
        const cardResult = await this.goalRepository.query(
          `${query} AND t.payment_method_id = $4`,
          [goal.userId, month, year, goal.paymentMethodId]
        );
        return parseFloat(cardResult[0]?.total || '0');

      case GoalType.SAVING:
        if (!goal.savingsBoxId) return 0;
        const savingsResult = await this.goalRepository.query(
          `SELECT COALESCE(SUM(t.amount), 0) as total
           FROM transactions t
           WHERE t.user_id = $1
             AND t.type = 'INVESTMENT'
             AND t.savings_box_id = $2
             AND t.competence_month = $3
             AND t.competence_year = $4`,
          [goal.userId, goal.savingsBoxId, month, year]
        );
        return parseFloat(savingsResult[0]?.total || '0');

      case GoalType.TARGET_VALUE:
        if (!goal.savingsBoxId) return 0;
        const targetResult = await this.goalRepository.query(
          `SELECT COALESCE(balance, 0) as total
           FROM savings_boxes
           WHERE id = $1 AND user_id = $2`,
          [goal.savingsBoxId, goal.userId]
        );
        return parseFloat(targetResult[0]?.total || '0');

      default:
        return 0;
    }
  }

  private validateGoalReferences(dto: CreateGoalDto): void {
    if (dto.type === GoalType.CATEGORY_LIMIT && !dto.categoryId) {
      throw new BadRequestException('Categoria é obrigatória para limite por categoria');
    }
    if (dto.type === GoalType.CARD_LIMIT && !dto.paymentMethodId) {
      throw new BadRequestException('Cartão é obrigatório para limite por cartão');
    }
    if (dto.type === GoalType.SAVING && !dto.savingsBoxId) {
      throw new BadRequestException('Caixa de investimento é obrigatório para meta de economia');
    }
    if (dto.type === GoalType.TARGET_VALUE && !dto.savingsBoxId) {
      throw new BadRequestException('Caixa de investimento é obrigatório para meta de valor alvo');
    }
  }
}
