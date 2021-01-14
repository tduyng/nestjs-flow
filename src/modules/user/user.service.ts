import { RegisterUserDto } from '@modules/auth/dto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  public async getUsers(): Promise<User[]> {
    return await this.userRepository.find();
  }
  public async getUserById(id: string): Promise<User> {
    return await this.userRepository.findOne({ where: { id: id } });
  }
  public async getUserByEmail(email: string): Promise<User> {
    return await this.userRepository.findOne({ where: { email: email } });
  }
  public async create(userDto: RegisterUserDto): Promise<User> {
    const user = this.userRepository.create(userDto);
    await this.userRepository.save(user);
    return user;
  }
}
