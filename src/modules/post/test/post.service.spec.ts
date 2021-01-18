import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PostRepository } from '../post.repository';
import { PostService } from '../post.service';

describe('PostService', () => {
  let postService: PostService;
  let postRepository;
  const mockPostRepository = () => ({
    getPosts: jest.fn(),
    getPostById: jest.fn(),
    createPost: jest.fn(),
    updatePost: jest.fn(),
    deletePost: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostService,
        {
          provide: PostRepository,
          useFactory: mockPostRepository,
        },
      ],
    }).compile();

    postService = module.get<PostService>(PostService);
    postRepository = module.get<PostRepository>(PostRepository);
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
      postRepository.updatePost.mockResolvedValue('some post');
      const id = 'some id';
      const post = {
        title: 'some',
        content: 'some',
      };
      const result = await postService.updatePost(id, post);
      expect(result).toEqual('some post');
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
});
