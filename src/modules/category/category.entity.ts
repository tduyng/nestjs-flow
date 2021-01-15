import { Post } from '@modules/post/post.entity';
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Category {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ unique: true })
  public name: string;

  @Column({ unique: true })
  public slug: string;

  @Column()
  @ManyToMany(() => Post, (post: Post) => post.categories)
  public posts: Post[];
}
