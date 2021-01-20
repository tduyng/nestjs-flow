import { AddressService } from '@modules/address/address.service';
import { PublicFile } from '@modules/files/public-file.entity';
import { PublicFileService } from '@modules/files/services/public-file.service';
import { NotFoundException } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRepository } from '../user.repository';
import { UserService } from '../user.service';
import { User } from '../user.entity';
import { CreateAddressDto } from '@modules/address/dto';
import { Address } from '@modules/address/address.entity';

const oneUser = {
  id: 'some id',
  email: 'some email',
  password: 'some password',
  avatar: null,
  address: null,
} as User;
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

  const mockUserRepository = () => ({
    getUsers: jest.fn(),
    getUserById: jest.fn(),
    getUserByEmail: jest.fn(),
    getUserByIdOrEmail: jest.fn(),
    deleteUser: jest.fn(),
    updateAvatar: jest.fn(),
    createAddress: jest.fn(),
    updateAddress: jest.fn(),
    deleteAddress: jest.fn(),
  });
  const mockFilesService = () => ({
    getUsers: jest.fn(),
    uploadPublicFile: jest.fn(),
    deletePublicFile: jest.fn(),
  });

  const mockAddressService = () => ({
    createAddressWithoutSave: jest.fn(),
    createAddress: jest.fn(),
    deleteAddress: jest.fn(),
    updateAddress: jest.fn(),
    updateAddressDirect: jest.fn(),
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
          useFactory: mockFilesService,
        },
        {
          provide: AddressService,
          useFactory: mockAddressService,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get<UserRepository>(UserRepository);
    publicFileService = module.get<PublicFileService>(PublicFileService);
    addressService = module.get<AddressService>(AddressService);
  });

  it('Should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('getUsers', () => {
    it('Should return all users', async () => {
      userRepository.getUsers.mockResolvedValue('all users');
      expect(userRepository.getUsers).not.toHaveBeenCalled();

      const result = await userService.getUsers();

      expect(userRepository.getUsers).toHaveBeenCalled();
      expect(result).toEqual('all users');
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
      publicFileService.uploadPublicFile.mockReturnValue(oneAvatar);
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
      publicFileService.deletePublicFile.mockReturnValue({ deleted: true });
      const result = await userService.deleteAvatar('some id');
      expect(result).toEqual({ deleted: true });
    });
  });

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
});
