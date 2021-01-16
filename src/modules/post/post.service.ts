import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePostDto, UpdatePostDto } from './dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './post.entity';
import { PostRepository } from './post.repository';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(PostRepository)
    private readonly postRepository: PostRepository,
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
      return await this.postRepository.createPost(postDto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  public async updatePost(id: string, postDto: UpdatePostDto): Promise<Post> {
    try {
      const post = await this.postRepository.getPostById(id);
      return await this.postRepository.updatePost(post, postDto);
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

  public async deletePost(id: string): Promise<void> {
    try {
      await this.postRepository.deletePost(id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
