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
  public async getUserByIdOrEmail(idOrEmail: string) {
    let user = await this.findOne({ where: { id: idOrEmail } });
    if (!user) {
      user = await this.findOne({ where: { email: idOrEmail } });
    }
    return user;
  }
  public async updateAvatar(user: User, userAvatarDto: UpdateAvatarDto) {
    return await this.update(user, userAvatarDto);
  }
  public async deleteUser(idOrEmail: string) {
    const user = await this.getUserByEmail(idOrEmail);
    await this.delete(user);
  }
}
