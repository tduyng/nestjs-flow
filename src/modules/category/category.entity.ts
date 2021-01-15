import { Post } from '@modules/post/post.entity';
import slugify from 'slugify';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Category {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ unique: true })
  public name: string;

  // @Exclude()
  @Column({ unique: true, nullable: true })
  public slug: string;

  @ManyToMany(() => Post, (post: Post) => post.categories)
  public posts: Post[];

  @BeforeInsert()
  @BeforeUpdate()
  async normalizeField() {
    this.name = this.name.charAt(0).toUpperCase() + this.name.slice(1);
    this.slug = slugify(this.name);
  }
}
