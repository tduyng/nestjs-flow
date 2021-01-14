import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto, UpdatePostDto } from './dto';
import { Post } from './post.interface';
import { v4 as uuid } from 'uuid';

@Injectable()
export class PostService {
  private posts: Post[] = [];

  public async getPosts(): Promise<Post[]> {
    return this.posts;
  }

  public async getPostById(id: string): Promise<Post> {
    const post = this.posts.find((p) => p.id === id);
    if (!post) {
      throw new NotFoundException(`Post with id ${id} not found`);
    }
    return post;
  }

  public async createPost(postDto: CreatePostDto): Promise<Post> {
    const post: Post = {
      ...postDto,
      id: uuid() as string,
    };
    this.posts.push(post);
    return post;
  }
  public async updatePost(id: string, postDto: UpdatePostDto): Promise<Post> {
    const post = this.posts.find((p) => p.id === id);
    if (!post) {
      throw new NotFoundException(`Post with id ${post.id} not found`);
    }
    const updated = Object.assign(post, postDto);
    const postIndex = this.posts.findIndex((p) => p.id === post.id);
    this.posts[postIndex] = updated;
    return updated;
  }

  public async deletePost(id: string): Promise<void> {
    const postIndex = this.posts.findIndex((p) => p.id === id);
    if (postIndex < 0) {
      throw new NotFoundException(`Post with id ${id} not found`);
    }
    this.posts.splice(postIndex, 1);
  }
}
