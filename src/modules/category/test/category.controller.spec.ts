import { Test, TestingModule } from '@nestjs/testing';
import { CategoryController } from '../category.controller';
import { Category } from '../category.entity';
import { CategoryService } from '../category.service';

const catArray = [new Category('Category 1'), new Category('Category 2')];
const oneCategory = new Category('Category 1');
oneCategory.slug = 'some';

describe('CategoryController', () => {
  let categoryController: CategoryController;
  // let categoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [
        {
          provide: CategoryService,
          useValue: {
            getCategories: jest.fn().mockReturnValue(catArray),
            getCategoryById: jest.fn().mockReturnValue(oneCategory),
            getCategoryByName: jest.fn().mockReturnValue(oneCategory),
            getCategoryBySlug: jest.fn().mockReturnValue(oneCategory),
            createCategory: jest.fn(),
            updateCategory: jest.fn(),
            deleteCategory: jest.fn(),
            getAllCategoriesByNameCaseSensitive: jest.fn(),
            getAllPostOfCategories: jest
              .fn()
              .mockReturnValue('list posts of category'),
          },
        },
      ],
    }).compile();
    categoryController = module.get<CategoryController>(CategoryController);
  });

  describe('getCategories route', () => {
    it('Should return an array of categories', async () => {
      const result = await categoryController.getCategories();
      expect(result).toEqual(catArray);
    });
  });

  describe('getCategory by slug route', () => {
    it('Should return a category', async () => {
      const result = await categoryController.getCategory(oneCategory.slug);
      expect(result).toEqual(oneCategory);
    });
  });

  describe('get posts of category route', () => {
    it('Should return a category', async () => {
      const result = await categoryController.getPostsOfCategory(
        oneCategory.slug,
      );
      expect(result).toEqual('list posts of category');
    });
  });
});
