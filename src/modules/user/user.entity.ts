import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
  BeforeUpdate,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IsEmail, Min } from 'class-validator';
import { classToPlain, Exclude } from 'class-transformer';
import { Address } from '../address/address.entity';
import { Post } from '@modules/post/post.entity';
import { PublicFile } from '@modules/files/public-file.entity';
import { PrivateFile } from '@modules/files/private-file.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  public id?: string;

  @Column({ nullable: true })
  public name: string;

  @Column({ unique: true })
  @IsEmail()
  public email: string;

  @Column()
  @Min(0)
  @Exclude()
  public password: string;

  @Column({ nullable: true })
  public phone?: string;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    nullable: true,
  })
  @CreateDateColumn()
  @Exclude()
  public createdAt?: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    nullable: true,
  })
  @UpdateDateColumn()
  @Exclude()
  public updatedAt?: Date;

  /* Relationship */
  @OneToOne(() => Address, (address: Address) => address.user, {
    cascade: true,
    eager: true,
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn()
  public address: Address;

  @OneToMany(() => Post, (post: Post) => post.author)
  public posts: Post[];

  @JoinColumn()
  @OneToOne(() => PublicFile, {
    cascade: true,
    eager: true,
    onDelete: 'CASCADE',
    nullable: true,
  })
  public avatar?: PublicFile;

  @OneToMany(() => PrivateFile, (file: PrivateFile) => file.owner, {
    cascade: true,
    eager: true,
    onDelete: 'CASCADE',
    nullable: true,
  })
  public files?: PrivateFile[];

  @Column({
    nullable: true,
  })
  @Exclude()
  public currentHashedRefreshToken?: string;

  @BeforeUpdate()
  updateTimestamp() {
    this.updatedAt = new Date();
  }

  toJSON() {
    return classToPlain(this);
  }

  constructor(
    name: string,
    email: string,
    password: string,
    phone?: string,
    address?: Address,
  ) {
    this.name = name;
    this.email = email;
    this.password = password;
    this.phone = phone;
    this.address = address;
  }
}
