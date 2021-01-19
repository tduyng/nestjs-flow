import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
class PublicFile {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ unique: true })
  public key: string;

  @Column()
  public url: string;
}

export default PublicFile;
