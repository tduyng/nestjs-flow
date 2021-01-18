import { NotFoundException } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRepository } from '../user.repository';
import { UserService } from '../user.service';

describe('UserService', () => {
  let userService: UserService;
  let userRepository;

  const mockUserRepository = () => ({
    getUsers: jest.fn(),
    getUserById: jest.fn(),
    getUserByEmail: jest.fn(),
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
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get<UserRepository>(UserRepository);
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
});
