import { string1To255 } from 'aws-sdk/clients/customerprofiles';
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../user/user.entity';

@Entity()
export class Address {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column()
  number: string;

  @Column()
  public street: string;

  @Column()
  public city: string;

  @Column()
  public country: string;

  @Column({ nullable: true })
  public complement?: string;

  @OneToOne(() => User, (user: User) => user.address)
  public user: User;
}
