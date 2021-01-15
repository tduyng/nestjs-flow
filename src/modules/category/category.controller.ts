import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  public async getCategories() {
    return await this.categoryService.getCategories();
  }

  @Get('/:slug')
  public async getCategory(@Param('slug') slug: string) {
    return await this.categoryService.getCategoryBySlug(slug);
  }

  @Get('/:slug/posts')
  public async getPostsOfCategory(@Param('slug') slug: string) {
    return await this.categoryService.getAllPostOfCategories(slug);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  public async createCategory(@Body() categoryDto: CreateCategoryDto) {
    return await this.categoryService.createCategory(categoryDto);
  }

  @Put('/:slug')
  @UseGuards(JwtAuthGuard)
  public async updateCategory(
    @Param('slug') slug: string,
    @Body() catDto: UpdateCategoryDto,
  ) {
    return await this.categoryService.updateCategory(slug, catDto);
  }

  @Delete('/:slug')
  @UseGuards(JwtAuthGuard)
  public async deleteCategory(@Param('slug') slug: string) {
    return await this.categoryService.deleteCategory(slug);
  }
}
