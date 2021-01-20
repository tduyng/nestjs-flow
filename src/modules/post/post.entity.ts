import {
  BeforeUpdate,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Min } from 'class-validator';
import { User } from '@modules/user/user.entity';
import { Category } from '@modules/category/category.entity';
import { Expose } from 'class-transformer';
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
  @ManyToOne(() => User, (author: User) => author.posts)
  public author: User;

  @ManyToMany(() => Category, (category: Category) => category.posts, {
    cascade: true,
  })
  @JoinTable()
  public categories: Category[];

  @BeforeUpdate()
  updateTimestamp() {
    this.updatedAt = new Date();
  }

  constructor(title: string, content: string) {
    this.title = title;
    this.content = content;
  }
}
