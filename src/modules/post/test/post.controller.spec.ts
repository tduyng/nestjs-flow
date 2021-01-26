import { CacheModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { PostController } from '../post.controller';
import { Post } from '../post.entity';
import { PostService } from '../services/post.service';

const postArray = [
  new Post('Post 1', 'This is a testing post 1'),
  new Post('Post 2', 'This is a post testing 2'),
];
const onePost = new Post('Post 1', 'Just a test');
const postDto = {
  title: 'Post 1',
  content: 'Just a test',
};
describe('PostController', () => {
  let postController: PostController;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot(), CacheModule.register()],
      controllers: [PostController],
      providers: [
        {
          provide: PostService,
          useValue: {
            getPosts: jest.fn().mockReturnValue(postArray),
            getPostById: jest.fn().mockReturnValue(onePost),
            createPost: jest.fn().mockReturnValue(onePost),
            updatePost: jest.fn().mockReturnValue(onePost),
            deletePost: jest.fn().mockReturnValue({
              status: 200,
              message: 'Ok',
            }),
          },
        },
      ],
    }).compile();
    postController = module.get<PostController>(PostController);
  });

  it('Should be defined', () => {
    expect(postController).toBeDefined();
  });

  describe('getPosts route', () => {
    it('Should return an array of posts', async () => {
      const result = await postController.getPosts();
      expect(result).toEqual(postArray);
    });
  });

  describe('getPostById route', () => {
    it('Should return a post', async () => {
      const result = await postController.getPostById('some id');
      expect(result).toEqual(onePost);
    });
  });

  describe('createPost route', () => {
    it('Should return a post', async () => {
      const result = await postController.createPost(postDto);
      expect(result).toEqual(onePost);
    });
  });

  describe('updatePost route', () => {
    it('Should update successfully a post', async () => {
      const result = await postController.updatePost('some id', postDto);
      expect(result).toEqual(onePost);
    });
  });

  describe('deletePost route', () => {
    it('Should delete successfully a post', async () => {
      const result = await postController.deletePost('some id');
      expect(result).toEqual({
        status: 200,
        message: 'Ok',
      });
    });
  });
});
