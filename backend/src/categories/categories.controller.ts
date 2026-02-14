import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CategoryType } from './entities/category.entity';

@ApiTags('Categories')
@ApiBearerAuth('JWT-auth')
@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @ApiOperation({ summary: 'Criar nova categoria' })
  @ApiBody({ type: CreateCategoryDto })
  @ApiOkResponse({ description: 'Categoria criada' })
  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto, @Request() req) {
    return this.categoriesService.create(createCategoryDto, req.user.userId);
  }

  @ApiOperation({ summary: 'Listar categorias por usuário' })
  @ApiQuery({
    name: 'type',
    required: false,
    description: 'Filtrar por tipo de categoria',
    enum: CategoryType,
  })
  @Get()
  findAll(@Request() req, @Query('type') type?: CategoryType) {
    if (type) {
      return this.categoriesService.findByType(req.user.userId, type);
    }
    return this.categoriesService.findAll(req.user.userId);
  }

  @ApiOperation({ summary: 'Buscar categoria por ID' })
  @ApiParam({ name: 'id', description: 'ID da categoria' })
  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.categoriesService.findOne(id, req.user.userId);
  }

  @ApiOperation({ summary: 'Atualizar categoria' })
  @ApiParam({ name: 'id', description: 'ID da categoria' })
  @ApiBody({ type: UpdateCategoryDto })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto, @Request() req) {
    return this.categoriesService.update(id, updateCategoryDto, req.user.userId);
  }

  @ApiOperation({ summary: 'Remover categoria' })
  @ApiParam({ name: 'id', description: 'ID da categoria' })
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.categoriesService.remove(id, req.user.userId);
  }
}
