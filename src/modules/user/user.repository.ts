import { Address } from '@modules/address/address.entity';
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
  public async updateAvatar(user: User, file: UpdateAvatarDto) {
    const updatedUser = await this.save({
      ...user,
      avatar: file.avatar,
    });
    return updatedUser;
  }
  public async deleteUser(idOrEmail: string) {
    const user = await this.getUserByEmail(idOrEmail);
    await this.delete(user);
    return { deleted: true };
  }

  public async createAddress(user: User, newAddress: Address) {
    user.address = newAddress;
    return await this.save(user);
  }
  public async updateAddress(user: User, updateAddress: Address) {
    user.address = updateAddress;
    return await this.save(user);
  }
  public async deleteAddress(user: User) {
    user.address = null;
    await this.save(user);
    return { deleted: true };
  }
}
