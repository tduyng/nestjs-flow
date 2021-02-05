import { AddressService } from '@modules/address/address.service';
import { PublicFile } from '@modules/files/public-file.entity';
import { PublicFileService } from '@modules/files/services/public-file.service';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRepository } from '../user.repository';
import { UserService } from '../user.service';
import { User } from '../user.entity';
import { CreateAddressDto } from '@modules/address/dto';
import { Address } from '@modules/address/address.entity';
import { PrivateFile } from '@modules/files/private-file.entity';
import { PrivateFileService } from '@modules/files/services/private-file.service';
import { UploadFileDto } from '@modules/files/dto';
import { Connection } from 'typeorm';
import { PaginatedUsersDto } from '../dto';
import { PaginationDto } from '@common/global-dto/pagination.dto';

const oneUser = {
  id: 'some id',
  email: 'some email',
  password: 'some password',
  avatar: null,
  address: null,
} as User;

const arrayPaginatedUsers = {
  data: [oneUser, oneUser],
  totalCount: 2,
} as PaginatedUsersDto;
const oneUserWithAvatar = {
  id: 'some id',
  email: 'some email',
  password: 'some password',
  address: null,
  avatar: {
    id: 'some id',
    key: 'some key',
    url: 'some url',
  },
} as User;

const oneAvatar = {
  id: 'some id',
  key: 'some key',
  url: 'some url',
} as PublicFile;

const oneAddress = {
  id: 'some id',
  number: 'some number',
  street: 'some street',
  city: 'some city',
  country: 'some country',
} as Address;

describe('UserService', () => {
  let userService: UserService;
  let userRepository;
  let publicFileService;
  let addressService;
  let privateFileService;
  // let connection;

  const mockUserRepository = () => ({
    getAllUsers: jest.fn(),
    getPaginatedUsers: jest.fn(),
    getUserById: jest.fn(),
    getUserWithFilesById: jest.fn(),
    getUserByEmail: jest.fn(),
    getUserByIdOrEmail: jest.fn(),
    deleteUser: jest.fn(),
    updateAvatar: jest.fn(),
    createAddress: jest.fn(),
    updateAddress: jest.fn(),
    deleteAddress: jest.fn(),
    getPrivateFromFile: jest.fn(),
    getAllPrivatesFileFromAWS: jest.fn(),
    addPrivateFile: jest.fn(),
    addMultiplePrivateFile: jest.fn(),
    deletePrivateFile: jest.fn(),
    canRemoveFile: jest.fn(),
  });
  const mockPublicFileService = () => ({
    getUsers: jest.fn(),
    uploadPublicFile: jest.fn(),
    deletePublicFile: jest.fn(),
    deletePublicFileWithRunner: jest.fn(),
    uploadPublicFileWithRunner: jest.fn(),
  });

  const mockAddressService = () => ({
    createAddressWithoutSave: jest.fn(),
    createAddress: jest.fn(),
    deleteAddress: jest.fn(),
    updateAddress: jest.fn(),
    updateAddressDirect: jest.fn(),
  });

  const mockPrivateFileService = () => ({
    getPrivateFileFromAWS: jest.fn(),
    getFileById: jest.fn(),
    generatePresignedUrl: jest.fn(),
    uploadPrivateFile: jest.fn(),
    uploadMultiplePrivateFile: jest.fn(),
    deletePrivateFile: jest.fn(),
  });

  const mockConnection = () => ({
    createQueryRunner: jest.fn(() => ({
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        update: jest.fn(),
      },
    })),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env',
        }),
      ],
      providers: [
        UserService,
        {
          provide: UserRepository,
          useFactory: mockUserRepository,
        },
        {
          provide: PublicFileService,
          useFactory: mockPublicFileService,
        },
        {
          provide: AddressService,
          useFactory: mockAddressService,
        },
        {
          provide: PrivateFileService,
          useFactory: mockPrivateFileService,
        },
        {
          provide: Connection,
          useFactory: mockConnection,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get<UserRepository>(UserRepository);
    publicFileService = module.get<PublicFileService>(PublicFileService);
    addressService = module.get<AddressService>(AddressService);
    privateFileService = module.get<PrivateFileService>(PrivateFileService);
    // connection = module.get<Connection>(Connection);
  });

  it('Should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('getAllUsers', () => {
    it('Should return all users', async () => {
      userRepository.getAllUsers.mockResolvedValue(arrayPaginatedUsers);
      const result = await userService.getUsers();
      expect(result).toEqual(arrayPaginatedUsers);
    });
  });

  describe('getPaginatedUsers', () => {
    it('Should return users by page', async () => {
      userRepository.getPaginatedUsers.mockResolvedValue(arrayPaginatedUsers);
      const result = await userService.getUsers({
        limit: 2,
        page: 1,
      } as PaginationDto);
      expect(result).toEqual(arrayPaginatedUsers);
    });
  });

  describe('getUserById', () => {
    it('Should throw an error if user not found', () => {
      userRepository.getUserById.mockResolvedValue(null);
      expect(userService.getUserById('some id')).rejects.toThrow(
        NotFoundException,
      );
    });
    it('Should return an user founded by id', async () => {
      userRepository.getUserById.mockResolvedValue('some user');
      const result = await userService.getUserById('some id');
      expect(result).toEqual('some user');
    });
  });

  describe('getUserByEmail', () => {
    it('Should throw an error if user not found', () => {
      userRepository.getUserByEmail.mockResolvedValue(null);
      expect(userService.getUserByEmail('some email')).rejects.toThrow(
        NotFoundException,
      );
    });
    it('Should return an user founded by id', async () => {
      userRepository.getUserByEmail.mockResolvedValue('some user');
      const result = await userService.getUserByEmail('some email');
      expect(result).toEqual('some user');
    });
  });

  describe('deleteUser', () => {
    it('Should delete user successfully', async () => {
      userRepository.deleteUser.mockReturnValue({ deleted: true });
      const result = await userService.deleteUser('some id');
      expect(result).toEqual({ deleted: true });
    });
  });

  /* Testing with avatar */
  describe('addAvatar', () => {
    it('Should throw an error when user not found', async () => {
      userRepository.getUserById.mockReturnValue(null);
      try {
        await userService.addAvatar('some id', {} as Buffer, 'some filename');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });

    it('Should add avatar successfully', async () => {
      userRepository.getUserById.mockReturnValue(oneUser);
      publicFileService.uploadPublicFileWithRunner.mockReturnValue(oneAvatar);
      userRepository.updateAvatar.mockReturnValue(Promise.resolve());
      const result = await userService.addAvatar(
        'some id',
        {} as Buffer,
        'some filename',
      );
      expect(result).toEqual(oneAvatar);
    });
  });

  describe('deleteAvatar', () => {
    it('Should deleteAvatar successfully', async () => {
      userRepository.getUserById.mockReturnValue(oneUserWithAvatar);
      userRepository.updateAvatar.mockReturnValue(Promise.resolve());
      publicFileService.deletePublicFileWithRunner.mockReturnValue({
        deleted: true,
      });
      const result = await userService.deleteAvatar('some id');
      expect(result).toEqual({ deleted: true });
    });
  });

  /* Testing with address */

  describe('userAddress', () => {
    it('Should throw an error when user not found', async () => {
      userRepository.getUserById.mockReturnValue(null);
      addressService.createAddressWithoutSave.mockReturnValue();
      try {
        await userService.createUserAddress('some id', {} as CreateAddressDto);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });

    describe('createAddress', () => {
      it('Should create successfully address for user', async () => {
        userRepository.getUserById.mockReturnValue(oneUser);
        userRepository.createAddress.mockReturnValue(oneUser);
        const result = await userService.createUserAddress(
          'some userId',
          oneAddress,
        );
        expect(result).toEqual(oneUser);
      });
    });

    describe('updateAddress', () => {
      it('Should create successfully address for user', async () => {
        userRepository.getUserById.mockReturnValue(oneUser);
        userRepository.updateAddress.mockReturnValue(oneUser);
        const result = await userService.updateUserAddress(
          'some userId',
          oneAddress,
        );
        expect(result).toEqual(oneUser);
      });
    });
    describe('deleteAddress', () => {
      it('Should create successfully address for user', async () => {
        userRepository.getUserById.mockReturnValue(oneUser);
        userRepository.deleteAddress.mockReturnValue({ deleted: true });
        const result = await userService.deleteUserAddress('some userId');
        expect(result).toEqual({ deleted: true });
      });
    });
  });

  /* Testing with private files */
  describe('getPrivateFileFromAWS', () => {
    it('Should throw an error unauthorized', async () => {
      const file = {
        stream: {} as any,
        info: {
          id: 'some fileId',
          key: 'some key',
          owner: {
            id: 'some userId',
          } as User,
        } as PrivateFile,
      };
      privateFileService.getPrivateFileFromAWS.mockReturnValue(file);
      try {
        await userService.getPrivateFileFromAWS(
          'some other userId',
          'some fileId',
        );
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
      }
    });

    it('Should return a file from AWS', async () => {
      const file = {
        stream: {} as any,
        info: {
          id: 'some fileId',
          key: 'some key',
          owner: {
            id: 'some userId',
          } as User,
        } as PrivateFile,
      };
      privateFileService.getPrivateFileFromAWS.mockReturnValue(file);
      const result = await userService.getPrivateFileFromAWS(
        'some userId',
        'some fileId',
      );
      expect(result).toBeDefined();
    });
  });

  describe('getAllPrivatesFileFromAWS', () => {
    it('Should throw an error when user not found', async () => {
      userRepository.getUserWithFilesById.mockReturnValue(null);
      try {
        await userService.getAllPrivatesFileFromAWS('some id');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });

    it('Should return array of files', async () => {
      const user = {
        id: 'some userId',
        files: [{ id: 'some fileId' } as PrivateFile],
      } as User;
      userRepository.getUserWithFilesById.mockReturnValue(user);
      const result = await userService.getAllPrivatesFileFromAWS('some userId');
      expect(result).toBeInstanceOf(Array);
    });
  });

  describe('addPrivateFile', () => {
    it('Should add successfully a file', async () => {
      const file = { id: 'some fileId' } as PrivateFile;
      privateFileService.uploadPrivateFile.mockReturnValue(file);
      const result = await userService.addPrivateFile(
        'some userId',
        {} as Buffer,
        'some filename',
      );
      expect(result).toEqual(file);
    });
  });

  describe('addMultiplePrivateFile', () => {
    it('Should add successfully multiple files', async () => {
      const files = [{ id: 'some fileId' }] as PrivateFile[];
      privateFileService.uploadMultiplePrivateFile.mockReturnValue(files);
      const result = await userService.addMultiplePrivateFile(
        'some userId',
        [] as UploadFileDto[],
      );
      expect(result).toEqual(files);
    });
  });

  describe('deletePrivateFile', () => {
    it('Should add successfully multiple files', async () => {
      userRepository.canRemoveFile.mockReturnValue(true);
      const result = await userService.deletePrivateFile(
        'some userId',
        'some fileId',
      );
      expect(result).toEqual({ deleted: true });
    });
  });
});
