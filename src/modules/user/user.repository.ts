import { EntityRepository, Repository } from 'typeorm';
import { UpdateAvatarDto } from './dto';
import { User } from './user.entity';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  public async getUsers(): Promise<User[]> {
    return await this.find();
  }
  public async getUserById(id: string): Promise<User> {
    return await this.findOne({ where: { id: id } });
  }
  public async getUserByEmail(email: string): Promise<User> {
    return await this.findOne({ where: { email: email } });
  }
  public async updateAvatar(user: User, userAvatarDto: UpdateAvatarDto) {
    return await this.update(user, userAvatarDto);
  }
}
