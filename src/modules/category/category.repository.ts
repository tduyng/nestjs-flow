import { EntityRepository, Repository } from 'typeorm';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';
import { Category } from './category.entity';

@EntityRepository(Category)
export class CategoryRepository extends Repository<Category> {
  public async getCategories(): Promise<Category[]> {
    return await this.find();
  }

  public async getCategoryById(id: string): Promise<Category> {
    return await this.findOne({ where: { id: id } });
  }

  public async createCategory(
    categoryDto: CreateCategoryDto,
  ): Promise<Category> {
    const category = this.create(categoryDto);
    await this.save(category);
    return category;
  }
  public async updateCategory(
    category: Category,
    categoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const updated = Object.assign(category, categoryDto);
    await this.save(updated);
    return updated;
  }

  public async deleteCategory(id: string): Promise<void> {
    await this.delete(id);
  }
}
