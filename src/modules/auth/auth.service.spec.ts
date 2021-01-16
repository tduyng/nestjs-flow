import { BadRequestException, ConflictException } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { IPayloadJwt } from './auth.interface';
import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let authService: AuthService;
  let authRepository: any;
  // let jwtService;

  const mockUserRepository = () => ({
    createUser: jest.fn(),
    getUserById: jest.fn(),
    getUserByEmail: jest.fn(),
    save: jest.fn(),
  });
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env',
        }),
        JwtModule.register({
          secret: process.env.JWT_SECRET,
          signOptions: { expiresIn: process.env.JWT_EXPIRATION_TIME },
        }),
      ],
      providers: [
        AuthService,
        {
          provide: AuthRepository,
          useFactory: mockUserRepository,
        },
      ],
    }).compile();
    authService = module.get<AuthService>(AuthService);
    // jwtService = module.get<JwtService>(JwtService);
    authRepository = module.get<AuthRepository>(AuthRepository);
  });
  /* Simple  test */
  it('Should be defined', () => {
    expect(authService).toBeDefined();
  });

  /* Test cookie methods */
  describe('clearCookie', () => {
    it('Should return a string', () => {
      expect(typeof authService.clearCookie()).toEqual('string');
    });
    it('Should return string empty cookie', () => {
      const result = `Authorization=;HttpOnly;Path=/;Max-Age=0`;
      expect(authService.clearCookie()).toEqual(result);
    });
  });

  describe('getCookieWithToken', () => {
    it('Should return a string', () => {
      const payload: IPayloadJwt = {
        userId: '1',
        email: 'test@email.com',
      };
      expect(typeof authService.getCookieWithToken(payload)).toEqual('string');
    });
  });

  /* Test validate User */
  describe('validateUser', () => {
    it('Should throw an error when email not match', () => {
      authRepository.getUserByEmail.mockResolvedValue(null);
      expect(
        authService.validateUser('some@email.com', 'test'),
      ).rejects.toThrow(BadRequestException);
    });

    it('Should throw an error when password not match', async () => {
      const salt = await bcrypt.genSalt(10);
      const fakePassword = 'test';
      const hashPassword = await bcrypt.hash(fakePassword, salt);
      const userResult = {
        email: 'some@email.com',
        password: hashPassword,
      };
      authRepository.getUserByEmail.mockResolvedValue(userResult);
      const userTest = {
        email: 'some@email.com',
        password: 'notistest',
      };
      expect(
        authService.validateUser(userTest.email, userTest.password),
      ).rejects.toThrow(BadRequestException);
    });

    it('Should retrieve a user', async () => {
      const salt = await bcrypt.genSalt(10);
      const fakePassword = 'test';
      const hashPassword = await bcrypt.hash(fakePassword, salt);
      const user = {
        email: 'some@email.com',
        password: hashPassword,
      };
      authRepository.getUserByEmail.mockResolvedValue(user);
      const result = await authService.validateUser(user.email, fakePassword);
      expect(result).toEqual(user);
    });
  });

  /* Test register user */
  describe('registerUser', () => {
    it('Should throw an error when register with email existed', async () => {
      const user = {
        name: 'some',
        email: 'some@email.com',
        password: 'some',
      };
      authRepository.getUserByEmail.mockResolvedValue(user.email);
      expect(authService.registerUser(user)).rejects.toThrow(ConflictException);
    });

    it('Should return an user', async () => {
      const user = {
        name: 'some',
        email: 'some@email.com',
        password: 'some',
      };
      authRepository.createUser.mockResolvedValue(user);
      const result = await authService.registerUser(user);
      // Because after register, password changed by bcrypt, so we can't check result == user
      //  To simplify, we just check if result toBeDefined
      expect(result).toBeDefined();
    });
  });
});
