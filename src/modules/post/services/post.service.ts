import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePostDto, UpdatePostDto } from '../dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from '../post.entity';
import { PostRepository } from '../post.repository';
import { PostSearchService } from './post-search.service';
import { In } from 'typeorm';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(PostRepository)
    private readonly postRepository: PostRepository,
    private postSearchService: PostSearchService,
  ) {}

  public async getPosts(): Promise<Post[]> {
    return this.postRepository.getPosts();
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
      return newPost;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  public async searchForPost(text: string) {
    const results = await this.postSearchService.search(text);
    const ids = results.map((result) => result.id) || [];
    return this.postRepository.find({ where: { id: In(ids) } });
  }

  public async updatePost(id: string, postDto: UpdatePostDto): Promise<Post> {
    try {
      const post = await this.postRepository.getPostById(id);
      await this.postRepository.updatePost(post, postDto);
      await this.postSearchService.update(post);
      return post;
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
      return {
        status: 200,
        message: 'Ok',
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
