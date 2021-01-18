import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CategoryRepository } from '../category.repository';
import { CategoryService } from '../category.service';

describe('CategoryService', () => {
  let categoryService: CategoryService;
  let categoryRepository;
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

  it('Should be defined', () => {
    expect(categoryService).toBeDefined();
  });

  describe('getCategories', () => {
    it('Should return all categories', async () => {
      categoryRepository.getCategories.mockResolvedValue('all categories');
      const result = await categoryService.getCategories();
      expect(result).toEqual('all categories');
    });
  });

  describe('getCategoryById', () => {
    it('Should throw an error when category not found', async () => {
      categoryRepository.getCategoryById.mockResolvedValue(null);
      try {
        await categoryService.getCategoryById('some id');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });

    it('Should return an category', async () => {
      categoryRepository.getCategoryById.mockResolvedValue('some category');
      const result = await categoryService.getCategoryById('some id');
      expect(result).toEqual('some category');
    });
  });

  describe('getCategoryByName', () => {
    it('Should throw an error when category not found', async () => {
      categoryRepository.getCategoryByName.mockResolvedValue(null);
      try {
        await categoryService.getCategoryByName('some name');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });

    it('Should return an category', async () => {
      categoryRepository.getCategoryByName.mockResolvedValue('some category');
      const result = await categoryService.getCategoryByName('some name');
      expect(result).toEqual('some category');
    });
  });

  describe('getCategoryBySlug', () => {
    it('Should throw an error when category not found', async () => {
      categoryRepository.getCategoryBySlug.mockResolvedValue(null);

      try {
        await categoryService.getCategoryBySlug('some slug');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });

    it('Should return an category', async () => {
      categoryRepository.getCategoryBySlug.mockResolvedValue('some category');
      const result = await categoryService.getCategoryBySlug('some slug');
      expect(result).toEqual('some category');
    });
  });

  describe('createCategory', () => {
    it('Should throw an error when slug category already exists', async () => {
      const category = {
        name: 'some',
      };
      categoryRepository.getAllCategoriesByNameCaseSensitive.mockResolvedValue([
        'some category already found',
      ]);
      try {
        await categoryService.createCategory(category);
      } catch (error) {
        expect(error).toBeInstanceOf(ConflictException);
      }
    });
    it('Should return an category', async () => {
      categoryRepository.getAllCategoriesByNameCaseSensitive.mockResolvedValue(
        [],
      );
      categoryRepository.createCategory.mockResolvedValue('some category');
      const category = {
        name: 'some',
      };
      const result = await categoryService.createCategory(category);
      expect(result).toEqual('some category');
    });
  });

  describe('updateCategory', () => {
    it('Should throw an error when category not found', async () => {
      categoryRepository.getCategoryById.mockResolvedValue(null);
      const id = 'some id';
      const category = {
        name: 'some',
      };

      try {
        await categoryService.updateCategory(id, category);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });
    it('Should update category', async () => {
      categoryRepository.getCategoryBySlug.mockResolvedValue('some category');
      categoryRepository.updateCategory.mockResolvedValue('some category');
      const slug = 'some slug';
      const category = {
        name: 'some',
      };
      const result = await categoryService.updateCategory(slug, category);
      expect(result).toEqual('some category');
    });
  });

  describe('deleteCategory', () => {
    it('Should delete category', async () => {
      const category = {
        id: '1',
        name: 'some',
        slug: 'some',
      };
      categoryRepository.getCategoryBySlug.mockResolvedValue(category);
      categoryRepository.deleteCategory.mockResolvedValue('some value');
      expect(categoryRepository.deleteCategory).not.toHaveBeenCalled();
      const result = await categoryService.deleteCategory(category.slug);
      expect(categoryRepository.deleteCategory).toHaveBeenCalledWith(
        category.id,
      );
      expect(result).toEqual('some value');
    });

    it('Should throw an error not found', async () => {
      categoryRepository.getCategoryBySlug.mockResolvedValue(null);
      try {
        await categoryService.deleteCategory('some slug');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });
  });
});
