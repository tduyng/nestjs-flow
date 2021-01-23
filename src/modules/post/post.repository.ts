import {
  EntityRepository,
  FindManyOptions,
  MoreThan,
  Repository,
} from 'typeorm';
import { CreatePostDto, UpdatePostDto } from './dto';
import { Post } from './post.entity';

@EntityRepository(Post)
export class PostRepository extends Repository<Post> {
  public async getPosts(offset?: number, limit?: number, startId?: string) {
    const where: FindManyOptions<Post>['where'] = {};
    let separateCount = 0;
    if (startId) {
      where.id = MoreThan(startId);
      separateCount = await this.count();
    }

    const [items, count] = await this.findAndCount({
      where,
      relations: ['author'],
      order: {
        createdAt: 'ASC',
      },
      skip: offset,
      take: limit,
    });
    return {
      items,
      count: startId ? separateCount : count,
    };
  }

  public async getAllPosts(): Promise<Post[]> {
    return await this.find();
  }

  public async getPostById(id: string): Promise<Post> {
    return await this.findOne({ where: { id: id } });
  }

  public async createPost(postDto: CreatePostDto): Promise<Post> {
    const post = this.create(postDto);
    await this.save(post);
    return post;
  }
  public async updatePost(post: Post, postDto: UpdatePostDto): Promise<Post> {
    const updated = Object.assign(post, postDto);
    updated.updatedAt = new Date();
    await this.save(updated);
    return updated;
  }

  public async deletePost(id: string): Promise<void> {
    await this.delete(id);
  }
}
