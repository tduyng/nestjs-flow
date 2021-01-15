import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { IsDate, IsEmail, Min } from 'class-validator';
import moment from 'moment';
import { Exclude, Expose } from 'class-transformer';
import { Address } from './adress.entity';
import { Post } from '@modules/post/post.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  @Expose()
  name: string;

  @Column({ unique: true })
  @IsEmail()
  @Expose()
  email: string;

  @Column()
  @Min(0)
  @Exclude()
  password: string;

  @Column({ nullable: true })
  phone: string;

  @Column({
    type: Date,
    default: moment(new Date()).format('YYYY-MM-DD HH:ss'),
    nullable: true,
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
  updatedAt;

  /* Relationship */
  @OneToOne(() => Address, (address: Address) => address.user, {
    cascade: true,
    eager: true,
  })
  @JoinColumn()
  address: Address;

  @OneToMany(() => Post, (post: Post) => post.author)
  posts: Post[];
}
