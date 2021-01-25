import {
  BeforeUpdate,
  Column,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Min } from 'class-validator';
import { User } from '@modules/user/user.entity';
import { Category } from '@modules/category/category.entity';
import { Expose } from 'class-transformer';
import { Comment } from '@modules/comment/comment.entity';
@Entity()
export class Post {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column()
  @Min(1)
  public title: string;

  @Column()
  @Min(10)
  public content: string;

  @Column('text', { array: true })
  public paragraphs: string[];

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    nullable: true,
  })
  @Expose()
  public createdAt?: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    nullable: true,
  })
  public updatedAt?: Date;

  /* Relationship */
  @Index('post_authorId_index')
  @ManyToOne(() => User, (author: User) => author.posts)
  public author: User;

  @ManyToMany(() => Category, (category: Category) => category.posts, {
    cascade: true,
  })
  @JoinTable()
  public categories: Category[];

  @OneToMany(() => Comment, (comment: Comment) => comment.post)
  public comments: Comment[];

  @BeforeUpdate()
  updateTimestamp() {
    this.updatedAt = new Date();
  }

  constructor(title: string, content: string) {
    this.title = title;
    this.content = content;
  }
}
