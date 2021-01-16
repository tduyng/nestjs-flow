import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CategoryRepository } from './category.repository';
import { CategoryService } from './category.service';

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
    it('Should throw an error when category not found', () => {
      categoryRepository.getCategoryById.mockResolvedValue(null);
      expect(categoryService.getCategoryById('some id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('Should return an category', async () => {
      categoryRepository.getCategoryById.mockResolvedValue('some category');
      const result = await categoryService.getCategoryById('some id');
      expect(result).toEqual('some category');
    });
  });

  describe('getCategoryByName', () => {
    it('Should throw an error when category not found', () => {
      categoryRepository.getCategoryByName.mockResolvedValue(null);
      expect(categoryService.getCategoryByName('some name')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('Should return an category', async () => {
      categoryRepository.getCategoryByName.mockResolvedValue('some category');
      const result = await categoryService.getCategoryByName('some name');
      expect(result).toEqual('some category');
    });
  });

  describe('getCategoryBySlug', () => {
    it('Should throw an error when category not found', () => {
      categoryRepository.getCategoryBySlug.mockResolvedValue(null);
      expect(categoryService.getCategoryBySlug('some slug')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('Should return an category', async () => {
      categoryRepository.getCategoryBySlug.mockResolvedValue('some category');
      const result = await categoryService.getCategoryBySlug('some slug');
      expect(result).toEqual('some category');
    });
  });

  describe('createCategory', () => {
    it('Should throw an error when slug category already exists', () => {
      categoryRepository.getCategoryBySlug.mockResolvedValue(null);
      expect(categoryService.getCategoryBySlug('some slug')).rejects.toThrow(
        ConflictException,
      );
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
      expect(categoryService.updateCategory(id, category)).rejects.toThrow(
        NotFoundException,
      );
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

  describe('deleteCategory', async () => {
    categoryRepository.delete.mockResolvedValue('some id');
    expect(categoryRepository.delete).not.toHaveBeenCalled();
    await categoryService.deleteCategory('some id');
    expect(categoryRepository.delete).toHaveBeenCalledWith('some id');
  });
});
