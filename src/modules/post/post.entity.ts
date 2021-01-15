import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import moment from 'moment-timezone';
import { IsDate, Min } from 'class-validator';
import { Expose } from 'class-transformer';
import { User } from '@modules/user/user.entity';
import { Category } from '@modules/category/category.entity';
@Entity()
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Min(1)
  @Expose()
  title: string;

  @Column()
  @Min(10)
  @Expose()
  content: string;

  @Column({
    type: Date,
    default: moment(new Date()).format('YYYY-MM-DD HH:ss'),
  })
  @IsDate()
  @Expose()
  createdAt;

  @Column({
    type: Date,
    default: moment(new Date()).format('YYYY-MM-DD HH:ss'),
    nullable: true,
  })
  @IsDate()
  @Expose()
  updatedAt;

  /* Relationship */
  @ManyToOne(() => User, (author: User) => author.posts)
  public author: User;

  @ManyToMany(() => Category, (category: Category) => category.posts)
  @JoinTable()
  public categories: Category[];
}
