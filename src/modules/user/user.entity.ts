import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
  BeforeUpdate,
} from 'typeorm';
import { IsEmail, Min } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';
import { Address } from './address.entity';
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
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    nullable: true,
  })
  @Expose()
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    nullable: true,
  })
  updatedAt: Date;

  /* Relationship */
  @OneToOne(() => Address, (address: Address) => address.user, {
    cascade: true,
    eager: true,
  })
  @JoinColumn()
  address: Address;

  @OneToMany(() => Post, (post: Post) => post.author)
  posts: Post[];

  @BeforeUpdate()
  updateTimestamp() {
    this.updatedAt = new Date();
  }
}
