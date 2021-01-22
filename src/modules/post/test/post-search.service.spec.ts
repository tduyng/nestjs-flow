import { User } from '@modules/user/user.entity';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { Test, TestingModule } from '@nestjs/testing';
import { Post } from '../post.entity';
import { IPostSearchBody } from '../post.interface';
import { PostSearchService } from '../services/post-search.service';

const onePostIndex = {
  index: 'posts',
  body: {
    id: 'some id',
    title: 'some title',
    content: 'some content',
    authorId: 'some authorId',
  } as IPostSearchBody,
};
const onePost = {
  id: 'some id',
  title: 'some title',
  content: 'some content',
  author: {
    id: 'some id',
  } as User,
} as Post;

const oneSearchResult = [
  {
    body: {
      hits: {
        hits: 'some thing',
      },
    },
  },
];

describe('PostSearchService', () => {
  let postSearchService: PostSearchService;
  let esService;

  const mockEsService = () => ({
    index: jest.fn(),
    search: jest.fn(),
    deleteByQuery: jest.fn(),
    updateByQuery: jest.fn(),
  });

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostSearchService,
        {
          provide: ElasticsearchService,
          useFactory: mockEsService,
        },
      ],
    }).compile();

    esService = module.get<ElasticsearchService>(ElasticsearchService);
    postSearchService = module.get<PostSearchService>(PostSearchService);
  });

  it('Should be defined', () => {
    expect(postSearchService).toBeDefined();
  });

  describe('indexPost', () => {
    it('Should return a post index', async () => {
      esService.index.mockReturnValue(onePostIndex);
      const result = await postSearchService.indexPost(onePost);
      expect(result).toEqual(onePostIndex);
    });
  });

  describe('search', () => {
    it('Should return an array of post', async () => {
      esService.search.mockReturnValue(oneSearchResult);
      const result = await postSearchService.search('some text');
      expect(result).toBeInstanceOf(Array);
    });
  });

  describe('update', () => {
    it('Should return an updated post', async () => {
      esService.updateByQuery.mockReturnValue('some result');
      const result = await postSearchService.update(onePost);
      expect(result).toBeDefined();
    });
  });

  describe('remove', () => {
    it('Should remove successfully a post index from es', async () => {
      esService.deleteByQuery.mockReturnValue(Promise.resolve());
      const result = await postSearchService.remove('some postId');
      expect(result).toEqual({ deleted: true });
    });
  });
});
