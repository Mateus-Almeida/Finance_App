import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category, CategoryType } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async create(
    createCategoryDto: CreateCategoryDto,
    userId: string,
  ): Promise<Category> {
    const category = this.categoryRepository.create({
      ...createCategoryDto,
      userId,
    });

    return this.categoryRepository.save(category);
  }

  async findAll(userId: string): Promise<Category[]> {
    return this.categoryRepository.find({
      where: [{ userId }, { isDefault: true }],
      order: { type: 'ASC', name: 'ASC' },
    });
  }

  async findByType(userId: string, type: CategoryType): Promise<Category[]> {
    return this.categoryRepository.find({
      where: [
        { userId, type },
        { isDefault: true, type },
      ],
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id },
    });

    if (!category || (category.userId !== userId && !category.isDefault)) {
      throw new NotFoundException('Categoria não encontrada');
    }

    return category;
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
    userId: string,
  ): Promise<Category> {
    const category = await this.findOne(id, userId);

    // Não permite editar categorias padrão
    if (category.isDefault) {
      throw new NotFoundException('Categorias padrão não podem ser editadas');
    }

    Object.assign(category, updateCategoryDto);

    return this.categoryRepository.save(category);
  }

  async remove(id: string, userId: string): Promise<void> {
    const category = await this.findOne(id, userId);

    // Não permite excluir categorias padrão
    if (category.isDefault) {
      throw new NotFoundException('Categorias padrão não podem ser excluídas');
    }

    await this.categoryRepository.remove(category);
  }
}
