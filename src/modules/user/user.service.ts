import { PaginationDto } from '@common/global-dto/pagination.dto';
import { AddressService } from '@modules/address/address.service';
import { CreateAddressDto, UpdateAddressDto } from '@modules/address/dto';
import { UploadFileDto } from '@modules/files/dto';
import { PrivateFileService } from '@modules/files/services/private-file.service';
import { PublicFileService } from '@modules/files/services/public-file.service';
import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { User } from './user.entity';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
    private readonly publicFileService: PublicFileService,
    private readonly addressService: AddressService,
    private readonly privateFileService: PrivateFileService,
    private connection: Connection,
  ) {}

  public async getUsers(pagination?: PaginationDto) {
    try {
      if (
        pagination &&
        Object.keys(pagination).length > 0 &&
        pagination.constructor === Object
      ) {
        return await this.userRepository.getPaginatedUsers(pagination);
      }
      return await this.userRepository.getAllUsers();
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
      return await this.userRepository.deleteUser(idOrEmail);
    } catch (error) {
      throw new NotFoundException('User not found');
    }
  }

  /* Public files */
  public async addAvatar(
    userId: string,
    imageBuffer: Buffer,
    filename: string,
  ) {
    const user = await this.getUserById(userId);
    const queryRunner = this.connection.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      if (user.avatar) {
        await queryRunner.manager.update(User, userId, {
          ...user,
          avatar: null,
        });
        await this.publicFileService.deletePublicFileWithRunner(
          queryRunner,
          user.avatar.id,
        );
      }
      const avatar = await this.publicFileService.uploadPublicFileWithRunner(
        queryRunner,
        imageBuffer,
        filename,
      );
      await queryRunner.manager.update(User, userId, {
        ...user,
        avatar: avatar,
      });

      await queryRunner.commitTransaction();
      return avatar;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    } finally {
      await queryRunner.release();
    }
  }

  public async deleteAvatar(userId: string) {
    const user = await this.getUserById(userId);
    const queryRunner = this.connection.createQueryRunner();
    const fileId = user.avatar?.id;
    let result = { deleted: false };
    if (fileId) {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      try {
        await queryRunner.manager.update(User, userId, {
          ...user,
          avatar: null,
        });

        await this.publicFileService.deletePublicFileWithRunner(
          queryRunner,
          fileId,
        );
        await queryRunner.commitTransaction();
        result = { deleted: true };
      } catch (error) {
        await queryRunner.rollbackTransaction();

        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      } finally {
        await queryRunner.release();
      }
    }
    return result;
  }

  public async testUpdateUserAvatar(user: User, fileId: string) {
    const avatar = await this.publicFileService.getFileById(fileId);
    const updatedUser = await this.userRepository.updateAvatar(user, {
      avatar: avatar,
    });
    return updatedUser;
  }

  /* Address */

  public async createUserAddress(userId: string, addressDto: CreateAddressDto) {
    const user = await this.getUserById(userId);
    try {
      const address = await this.addressService.createAddressWithoutSave(
        addressDto,
      );
      return await this.userRepository.createAddress(user, address);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  public async updateUserAddress(userId: string, addressDto: UpdateAddressDto) {
    const user = await this.getUserById(userId);
    try {
      const address = user.address;
      await this.addressService.updateAddressDirect(address, addressDto);
      return user;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  public async deleteUserAddress(userId: string) {
    const user = await this.getUserById(userId);
    try {
      const address = user.address;
      if (address) {
        await this.addressService.deleteAddress(address?.id);
      }
      user.address = null;
      return await this.userRepository.deleteAddress(user);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /* Private files */
  public async getPrivateFileFromAWS(userId: string, fileId: string) {
    try {
      const file = await this.privateFileService.getPrivateFileFromAWS(fileId);
      if (file.info.owner.id === userId) {
        return file;
      }
      throw new UnauthorizedException();
    } catch (error) {
      if (error.status) {
        throw error;
      }
      throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
    }
  }

  public async getAllPrivatesFileFromAWS(userId: string) {
    try {
      const userWithFiles = await this.userRepository.getUserWithFilesById(
        userId,
      );
      if (!userWithFiles) {
        throw new NotFoundException('User not found');
      }
      return Promise.all(
        userWithFiles.files.map(async (file) => {
          const url = await this.privateFileService.generatePresignedUrl(
            file.key,
          );
          return {
            ...file,
            url,
          };
        }),
      );
    } catch (error) {
      if (error.status) {
        throw error;
      }
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  public async addPrivateFile(
    userId: string,
    dataBuffer: Buffer,
    filename: string,
  ) {
    return await this.privateFileService.uploadPrivateFile(
      userId,
      dataBuffer,
      filename,
    );
  }

  public async addMultiplePrivateFile(
    userId: string,
    uploadFiles: UploadFileDto[],
  ) {
    return await this.privateFileService.uploadMultiplePrivateFile(
      userId,
      uploadFiles,
    );
  }
  public async deletePrivateFile(userId: string, fileId: string) {
    try {
      const canRemoveFile = await this.userRepository.canRemoveFile(
        userId,
        fileId,
      );
      if (canRemoveFile) {
        await this.privateFileService.deletePrivateFile(fileId);
        return { deleted: true };
      }
      return { deleted: false };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /* Test method without AWS */

  public async testAddFileWithoutAWS(
    userId: string,
    dataBuffer: Buffer,
    filename: string,
  ) {
    return await this.privateFileService.testUploadFileWithoutAWS(
      userId,
      dataBuffer,
      filename,
    );
  }
  public async testAddMultipleFilesWithoutAWS(
    userId: string,
    uploadFiles: UploadFileDto[],
  ) {
    return await this.privateFileService.testUploadMultipleFilesWithoutAWS(
      userId,
      uploadFiles,
    );
  }
  public async testDeletePrivateFileWithoutAWS(userId: string, fileId: string) {
    try {
      const canRemoveFile = await this.userRepository.canRemoveFile(
        userId,
        fileId,
      );
      if (canRemoveFile) {
        await this.privateFileService.testDeletePrivateFileWithoutAWS(fileId);
        return { deleted: true };
      }
      return { deleted: false };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
