import {
  BeforeUpdate,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import moment from 'moment-timezone';
import { IsDate, Min } from 'class-validator';
import { User } from '@modules/user/user.entity';
import { Category } from '@modules/category/category.entity';
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
    type: Date,
    default: moment(new Date()).format('YYYY-MM-DD HH:ss'),
  })
  @IsDate()
  public createdAt;

  @Column({
    type: Date,
    default: moment(new Date()).format('YYYY-MM-DD HH:ss'),
    nullable: true,
  })
  @IsDate()
  public updatedAt;

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
    this.updatedAt = moment(new Date()).format('YYYY-MM-DD HH:ss');
  }
}
