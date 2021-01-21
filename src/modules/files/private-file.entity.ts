import { User } from '@modules/user/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class PrivateFile {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ unique: true })
  public key: string;

  @ManyToOne(() => User, (owner: User) => owner.files)
  public owner: User;
}
