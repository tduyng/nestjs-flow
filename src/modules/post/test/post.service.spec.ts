import { Test, TestingModule } from '@nestjs/testing';
import { PostRepository } from '../post.repository';
import { PostSearchService } from '../services/post-search.service';
import { PostService } from '../services/post.service';
import { CacheModule, CACHE_MANAGER, NotFoundException } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

describe('PostService', () => {
  let postService: PostService;
  let postRepository;
  let cacheManager;

  const mockPostRepository = () => ({
    getPosts: jest.fn(),
    getPostById: jest.fn(),
    createPost: jest.fn(),
    updatePost: jest.fn(),
    deletePost: jest.fn(),
  });
  const mockPostSearchService = () => ({
    indexPost: jest.fn(),
    search: jest.fn(),
    remove: jest.fn(),
    update: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot(), CacheModule.register()],
      providers: [
        PostService,
        {
          provide: PostRepository,
          useFactory: mockPostRepository,
        },
        {
          provide: PostSearchService,
          useFactory: mockPostSearchService,
        },
      ],
    }).compile();

    postService = module.get<PostService>(PostService);
    postRepository = module.get<PostRepository>(PostRepository);
    cacheManager = module.get<any>(CACHE_MANAGER);
  });

  it('Should be defined', () => {
    expect(postService).toBeDefined();
  });

  describe('getPosts', () => {
    it('Should return all users', async () => {
      postRepository.getPosts.mockResolvedValue('all users');
      const result = await postService.getPosts();
      expect(result).toEqual('all users');
    });
  });

  describe('getPostById', () => {
    it('Should throw an error when user not found', async () => {
      postRepository.getPostById.mockResolvedValue(null);
      try {
        await postService.getPostById('some id');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });

    it('Should return an user', async () => {
      postRepository.getPostById.mockResolvedValue('some post');
      const result = await postService.getPostById('some id');
      expect(result).toEqual('some post');
    });
  });

  describe('createPost', () => {
    it('Should return an user', async () => {
      postRepository.createPost.mockResolvedValue('some post');
      const post = {
        title: 'some',
        content: 'some',
      };
      const result = await postService.createPost(post);
      expect(result).toEqual('some post');
    });
  });

  describe('updatePost', () => {
    it('Should throw an error when post not found', async () => {
      postRepository.getPostById.mockResolvedValue(null);
      const id = 'some id';
      const post = {
        title: 'some',
        content: 'some',
      };
      try {
        await postService.updatePost(id, post);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });
    it('Should update post', async () => {
      postRepository.getPostById.mockResolvedValue('some post');
      postRepository.updatePost.mockResolvedValue('some updated post');
      const id = 'some id';
      const post = {
        title: 'some',
        content: 'some',
      };
      const result = await postService.updatePost(id, post);
      expect(result).toEqual('some updated post');
    });
  });

  describe('deletePost', () => {
    it('Should delete product', async () => {
      postRepository.deletePost.mockResolvedValue(null);
      expect(postRepository.deletePost).not.toHaveBeenCalled();
      await postService.deletePost('some id');
      expect(postRepository.deletePost).toHaveBeenCalledWith('some id');
    });
  });

  describe('clearCache', () => {
    it('Should clear caching successfully', async () => {
      cacheManager.del = jest.fn();
      cacheManager = {
        store: {
          keys: jest.fn(),
        },
      };
      cacheManager.store.keys.mockReturnValue(['some', 'thing']);
      expect(postRepository.deletePost).not.toHaveBeenCalled();
      await postService.deletePost('some id');
      expect(postRepository.deletePost).toHaveBeenCalledWith('some id');
    });
  });
});
