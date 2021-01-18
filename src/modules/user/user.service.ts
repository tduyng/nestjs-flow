import { FilesService } from '@modules/files/files.service';
import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
    private readonly filesService: FilesService,
  ) {}

  public async getUsers(): Promise<User[]> {
    return await this.userRepository.getUsers();
  }
  public async getUserById(id: string): Promise<User> {
    try {
      const user = await this.userRepository.getUserById(id);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return user;
    } catch (error) {
      if (error.status === HttpStatus.NOT_FOUND) {
        throw error;
      } else {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
  public async getUserByEmail(email: string): Promise<User> {
    try {
      const user = await this.userRepository.getUserByEmail(email);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return user;
    } catch (error) {
      if (error.status === HttpStatus.NOT_FOUND) {
        throw error;
      } else {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  async addAvatar(userId: string, imageBuffer: Buffer, filename: string) {
    const user = await this.userRepository.getUserById(userId);
    if (user.avatar) {
      await this.userRepository.updateAvatar(user, {
        avatar: null,
      });
      await this.filesService.deletePublicFile(user.avatar.id);
    }
    const avatar = await this.filesService.uploadPublicFile(
      imageBuffer,
      filename,
    );
    await this.userRepository.updateAvatar(user, {
      avatar,
    });
    return avatar;
  }

  async deleteAvatar(userId: string) {
    const user = await this.userRepository.getUserById(userId);
    const fileId = user.avatar?.id;
    if (fileId) {
      await this.userRepository.updateAvatar(user, {
        avatar: null,
      });
      await this.filesService.deletePublicFile(fileId);
    }
  }
}
