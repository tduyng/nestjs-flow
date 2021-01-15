import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import moment from 'moment-timezone';
import { IsDate, Min } from 'class-validator';
@Entity()
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Min(1)
  title: string;

  @Column()
  @Min(10)
  content: string;

  @Column({
    type: Date,
    default: moment(new Date()).format('YYYY-MM-DD HH:ss'),
  })
  @IsDate()
  createdAt: Date;

  @Column({
    type: Date,
    default: moment(new Date()).format('YYYY-MM-DD HH:ss'),
    nullable: true,
  })
  @IsDate()
  updatedAt: Date;
}
