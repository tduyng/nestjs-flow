import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import moment from 'moment-timezone';
import { IsDate, Min } from 'class-validator';
import { Expose } from 'class-transformer';
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
}
