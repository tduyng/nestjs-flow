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
}
