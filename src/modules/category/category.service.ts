import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  public async getCategories() {
    try {
      return await this.categoryRepository.find();
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  public async getCategoryById(id: string) {
    try {
      const category = await this.categoryRepository.findOne({
        where: { id: id },
      });
      if (!category) {
        throw new NotFoundException('Category not found');
      }
      return category;
    } catch (error) {
      if (error.statusCode == HttpStatus.NOT_FOUND) {
        throw error;
      } else {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  public async getCategoryByName(name: string) {
    try {
      const category = await this.categoryRepository.findOne({
        where: { name: name },
      });
      if (!category) {
        throw new NotFoundException('Category not found');
      }
      return category;
    } catch (error) {
      if (error.statusCode == HttpStatus.NOT_FOUND) {
        throw error;
      } else {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
  public async getCategoryBySlug(slug: string) {
    try {
      const category = await this.categoryRepository.findOne({
        where: { slug: slug },
      });
      if (!category) {
        throw new NotFoundException('Category not found');
      }
      return category;
    } catch (error) {
      if (error.statusCode == HttpStatus.NOT_FOUND) {
        throw error;
      } else {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  public async getAllCategoriesByNameCaseSensitive(name: string) {
    try {
      return await this.categoryRepository.find({
        where: `"name" ILIKE '${name}'`,
      });

      //   // We can also query like:
      //   const posts = await repository.createQueryBuilder("post")
      //  .where("LOWER(post.title) = LOWER(:title)", { title })
      //  .getMany()
      // https://github.com/typeorm/typeorm/issues/1231
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  public async createCategory(categoryDto: CreateCategoryDto) {
    const { name } = categoryDto;
    try {
      const check = await this.getAllCategoriesByNameCaseSensitive(name);
      if (check) {
        throw new ConflictException(
          `Category with name ${name} already exists!`,
        );
      }
      const category = this.categoryRepository.create(categoryDto);
      await this.categoryRepository.save(category);
      return category;
    } catch (error) {
      if (error.statusCode == HttpStatus.CONFLICT) {
        throw error;
      } else {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  public async updateCategory(slug: string, categoryDto: UpdateCategoryDto) {
    const { name } = categoryDto;
    try {
      const category = await this.getCategoryBySlug(slug);
      category.name = name;
      await this.categoryRepository.save(category);
      return category;
    } catch (error) {
      if (error.statusCode == HttpStatus.NOT_FOUND) {
        throw error;
      } else {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  public async deleteCategory(slug: string) {
    try {
      const category = await this.getCategoryBySlug(slug);
      await this.categoryRepository.delete(category);
    } catch (error) {
      if (error.statusCode == HttpStatus.NOT_FOUND) {
        throw error;
      } else {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
}
