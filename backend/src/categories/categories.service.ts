import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
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

    if (category.isDefault) {
      throw new NotFoundException('Categorias padrão não podem ser editadas');
    }

    Object.assign(category, updateCategoryDto);

    return this.categoryRepository.save(category);
  }

  async remove(id: string, userId: string): Promise<void> {
    const category = await this.findOne(id, userId);

    if (category.isDefault) {
      throw new NotFoundException('Categorias padrão não podem ser excluídas');
    }

    await this.categoryRepository.remove(category);
  }

  async seedDefaultCategories(userId: string): Promise<void> {
    const defaultCategories = [
      { name: 'Alimentação', color: '#10b981', icon: 'mdi-food', isDefault: true },
      { name: 'Transporte', color: '#3b82f6', icon: 'mdi-car', isDefault: true },
      { name: 'Moradia', color: '#8b5cf6', icon: 'mdi-home', isDefault: true },
      { name: 'Saúde', color: '#ef4444', icon: 'mdi-hospital', isDefault: true },
      { name: 'Lazer', color: '#f97316', icon: 'mdi-gamepad-variant', isDefault: true },
      { name: 'Assinaturas', color: '#ec4899', icon: 'mdi-netflix', isDefault: true },
      { name: 'Educação', color: '#06b6d4', icon: 'mdi-school', isDefault: true },
      { name: 'Vestuário', color: '#84cc16', icon: 'mdi-tshirt-crew', isDefault: true },
      { name: 'Outros', color: '#6b7280', icon: 'mdi-dots-horizontal', isDefault: true },
    ];

    for (const cat of defaultCategories) {
      const exists = await this.categoryRepository.findOne({
        where: { name: cat.name, isDefault: true },
      });

      if (!exists) {
        await this.categoryRepository.save({
          ...cat,
          userId: null,
        });
      }
    }
  }
}
