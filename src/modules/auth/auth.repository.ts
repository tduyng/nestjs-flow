import { User } from '@modules/user/user.entity';
import { Repository, EntityRepository } from 'typeorm';
import { RegisterUserDto } from './dto';

@EntityRepository(User)
export class AuthRepository extends Repository<User> {
  public async createUser(userDto: RegisterUserDto): Promise<User> {
    const user = this.create(userDto);
    await this.save(user);
    return user;
  }
  public async getUserById(id: string): Promise<User> {
    return await this.findOne({ where: { id: id } });
  }
  public async getUserByEmail(email: string): Promise<User> {
    return await this.findOne({ where: { email: email } });
  }
}
