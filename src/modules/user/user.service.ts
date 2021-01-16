import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
  ) {}

  public async getUsers(): Promise<User[]> {
    return await this.userRepository.getUsers();
  }
  public async getUserById(id: string): Promise<User> {
    return await this.userRepository.getUserById(id);
  }
  public async getUserByEmail(email: string): Promise<User> {
    return await this.userRepository.getUserByEmail(email);
  }
}
