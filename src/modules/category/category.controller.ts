import { Controller } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  public async getCategories() {
    return await this.categoryService.getCategories();
  }

  public async getCategory(slug: string) {
    return await this.categoryService.getCategoryBySlug(slug);
  }
  public async createCategory(categoryDto: CreateCategoryDto) {
    return await this.categoryService.createCategory(categoryDto);
  }
  public async updateCategory(slug: string, catDto: UpdateCategoryDto) {
    return await this.categoryService.updateCategory(slug, catDto);
  }
  public async deleteCategory(slug: string) {
    return await this.categoryService.deleteCategory(slug);
  }
}
