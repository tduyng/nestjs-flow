import { Address } from '@modules/address/address.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
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
  public async getUserWithFilesById(id: string): Promise<User> {
    return await this.findOne({ where: { id: id }, relations: ['files'] });
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

  public async deleteUser(idOrEmail: string) {
    const user = await this.getUserByEmail(idOrEmail);
    await this.delete(user);
    return { deleted: true };
  }

  public async updateAvatar(user: User, file: UpdateAvatarDto) {
    const updatedUser = await this.save({
      ...user,
      avatar: file.avatar,
    });
    return updatedUser;
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

  public async canRemoveFile(userId: string, fileId: string) {
    try {
      const user = await this.findOne({
        where: { id: userId },
        relations: ['files'],
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      const files = user.files || [];
      let fileIndex = -1;
      if (files.length > 0) {
        fileIndex = files.findIndex((f) => f.id === fileId);
      }
      if (fileIndex === -1) {
        throw new BadRequestException('File is not belongs to current user');
      }
      return true;
    } catch (error) {
      return false;
    }
  }
}
