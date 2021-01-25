import { Post } from '@modules/post/post.entity';
import { User } from '@modules/user/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column()
  public content: string;

  @ManyToOne(() => Post, (post: Post) => post.comments)
  public post: Post;

  @ManyToOne(() => User, (author: User) => author.posts)
  public author: User;
}
