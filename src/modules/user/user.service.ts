import { AddressService } from '@modules/address/address.service';
import { CreateAddressDto, UpdateAddressDto } from '@modules/address/dto';
import { FilesService } from '@modules/files/services/files.service';
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
    private readonly addressService: AddressService,
  ) {}

  public async getUsers(): Promise<User[]> {
    try {
      return await this.userRepository.getUsers();
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
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

  public async getUserByIdOrEmail(idOrEmail: string) {
    try {
      const user = await this.userRepository.getUserByIdOrEmail(idOrEmail);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return user;
    } catch (error) {
      throw error;
    }
  }

  public async deleteUser(idOrEmail: string) {
    try {
      return await this.deleteUser(idOrEmail);
    } catch (error) {
      throw new NotFoundException('User not found');
    }
  }

  public async addAvatar(
    userId: string,
    imageBuffer: Buffer,
    filename: string,
  ) {
    try {
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
      await this.userRepository.updateAvatar(user, { avatar: avatar });
      return avatar;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  public async testUpdateUserAvatar(user: User, fileId: string) {
    const avatar = await this.filesService.getFileById(fileId);
    const updatedUser = await this.userRepository.updateAvatar(user, {
      avatar: avatar,
    });
    return updatedUser;
  }

  public async deleteAvatar(userId: string) {
    try {
      const user = await this.userRepository.getUserById(userId);
      const fileId = user.avatar?.id;
      if (fileId) {
        await this.userRepository.updateAvatar(user, {
          avatar: null,
        });
        await this.filesService.deletePublicFile(fileId);
      }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  public async createUserAddress(userId: string, addressDto: CreateAddressDto) {
    try {
      const user = await this.userRepository.getUserById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      const address = await this.addressService.createAddressWithoutSave(
        addressDto,
      );
      return await this.userRepository.createAddress(user, address);
    } catch (error) {
      if (error.status === HttpStatus.NOT_FOUND) {
        throw error;
      }
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  public async updateUserAddress(userId: string, addressDto: UpdateAddressDto) {
    try {
      const user = await this.userRepository.getUserById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      const address = user.address;
      await this.addressService.updateAddressDirect(address, addressDto);
      return user;
    } catch (error) {
      if (error.status === HttpStatus.NOT_FOUND) {
        throw error;
      }
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  public async deleteUserAddress(userId: string) {
    try {
      const user = await this.userRepository.getUserById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      const address = user.address;
      await this.addressService.deleteAddress(address.id);
      user.address = null;
      return await this.userRepository.deleteAddress(user);
    } catch (error) {
      if (error.status === HttpStatus.NOT_FOUND) {
        throw error;
      }
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
