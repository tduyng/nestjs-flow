import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  CACHE_MANAGER,
  Inject,
} from '@nestjs/common';
import { CreatePostDto, UpdatePostDto } from '../dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from '../post.entity';
import { PostRepository } from '../post.repository';
import { PostSearchService } from './post-search.service';
import { In } from 'typeorm';
import { GET_POSTS_CACHE_KEY } from '../types/post.types';
import { Cache } from 'cache-manager';
@Injectable()
export class PostService {
  constructor(
    @InjectRepository(PostRepository)
    private readonly postRepository: PostRepository,
    private postSearchService: PostSearchService,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  public async getPosts(offset?: number, limit?: number, startId?: string) {
    return this.postRepository.getPosts(offset, limit, startId);
  }

  public async clearCache(): Promise<void> {
    const keys: string[] = await this.cacheManager.store.keys();
    keys.forEach((key) => {
      if (key.startsWith(GET_POSTS_CACHE_KEY)) {
        this.cacheManager.del(key);
      }
    });
  }

  public async getPostById(id: string): Promise<Post> {
    try {
      const post = this.postRepository.getPostById(id);
      if (!post) {
        throw new NotFoundException(`Post with id ${id} not found`);
      }
      return post;
    } catch (error) {
      if (error.status == HttpStatus.NOT_FOUND) {
        throw error;
      } else {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  public async createPost(postDto: CreatePostDto): Promise<Post> {
    try {
      const newPost = await this.postRepository.createPost(postDto);
      await this.postSearchService.indexPost(newPost);
      await this.clearCache();
      return newPost;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  public async searchForPost(
    text: string,
    offset?: number,
    limit?: number,
    startId?: string,
  ) {
    const { results, count } = await this.postSearchService.search(
      text,
      offset,
      limit,
      startId,
    );
    const ids = results.map((result) => result.id) || [];
    const items = await this.postRepository.find({ where: { id: In(ids) } });
    return {
      items,
      count,
    };
  }

  public async updatePost(id: string, postDto: UpdatePostDto): Promise<Post> {
    try {
      const post = await this.postRepository.getPostById(id);
      const updated = await this.postRepository.updatePost(post, postDto);
      await this.postSearchService.update(updated);
      await this.clearCache();
      return updated;
    } catch (error) {
      if (error.status === HttpStatus.NOT_FOUND) {
        throw error;
      } else {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  public async deletePost(id: string) {
    try {
      await this.postRepository.deletePost(id);
      await this.postSearchService.remove(id);
      await this.clearCache();
      return {
        status: 200,
        message: 'Ok',
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  public async getPostsWithParagraph(paragraph: string) {
    return this.postRepository.query(
      'SELECT * from post WHERE $1 = ANY(paragraphs)',
      [paragraph],
    );
  }
}
