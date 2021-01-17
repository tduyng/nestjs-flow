import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Category } from '../category.entity';
import { CategoryRepository } from '../category.repository';
import { CategoryService } from '../category.service';

const nameCat1 = 'Category 1';
const nameCat2 = 'Category 2';

const categoryArray = [
  new Category(nameCat1),
  new Category(nameCat2),
  new Category('other category'),
];

const oneCategory = new Category(nameCat1);

const mockCategoryRepository = () => ({
  getCategories: jest.fn(),
  getCategoryById: jest.fn(),
  getCategoryByName: jest.fn(),
  getCategoryBySlug: jest.fn(),
  createCategory: jest.fn(),
  updateCategory: jest.fn(),
  deleteCategory: jest.fn(),
  getAllCategoriesByNameCaseSensitive: jest.fn(),
});

describe('CategoryService Test strategy 2', () => {
  let categoryService: CategoryService;
  let categoryRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        {
          provide: CategoryRepository,
          useFactory: mockCategoryRepository,
        },
      ],
    }).compile();

    categoryService = module.get<CategoryService>(CategoryService);
    categoryRepository = module.get<CategoryRepository>(CategoryRepository);
  });

  it('should be defined', () => {
    expect(categoryService).toBeDefined();
  });

  describe('getCategories', () => {
    it('Should return an array of category', async () => {
      categoryRepository.getCategories.mockResolvedValue(categoryArray);
      expect(categoryService.getCategories()).resolves.toEqual(categoryArray);
    });
  });

  describe('getCategoryBySlug', () => {
    it('Should throw an error when slug not found', async () => {
      categoryRepository.getCategoryBySlug.mockResolvedValue(null);
      try {
        await categoryService.getCategoryBySlug(oneCategory.slug);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });

    it('Should return an category', async () => {
      categoryRepository.getCategoryBySlug.mockResolvedValue(oneCategory);
      const result = await categoryService.getCategoryBySlug(oneCategory.slug);
      expect(result).toEqual(oneCategory);
    });
  });
});
