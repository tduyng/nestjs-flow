import { User } from '@modules/user/user.entity';
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class PublicFile {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ unique: true })
  public key: string;

  @Column()
  public url: string;

  @OneToOne(() => User)
  public user: User;
}
