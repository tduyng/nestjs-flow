import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { AppModule } from '@app/app.module';
import { AuthController } from '../auth.controller';
import { AuthRepository } from '../auth.repository';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import request from 'supertest';
import { RegisterUserDto } from '../dto';

describe('AuthController', () => {
  let app: INestApplication;
  let authService: AuthService;
  let authRepository;
  const mockAuthRepository = () => ({
    createUser: jest.fn(),
    getUserById: jest.fn(),
    getUserByEmail: jest.fn(),
    save: jest.fn(),
  });
  const mockAuthService = () => ({
    registerUser: jest.fn(),
    validateUser: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env',
        }),
        JwtModule.register({
          secret: process.env.JWT_SECRET,
          signOptions: { expiresIn: process.env.JWT_EXPIRATION_TIME },
        }),
      ],
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useFactory: mockAuthService,
        },
        {
          provide: AuthRepository,
          useFactory: mockAuthRepository,
        },
      ],
    })
      .overrideProvider(AuthRepository)
      .useValue(authRepository)
      .overrideProvider(AuthService)
      .useValue(authService)
      .compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  describe('Register user', () => {
    it('Should throw an error when register with an email already exists', async () => {
      const registerDto: RegisterUserDto = {
        email: 'some email',
        password: 'some',
      };
      // authRepository.getUserByEmail.mockResolvedValue(registerDto.email);
      return await request(app.getHttpServer())
        .post('/api/auth')
        .send(registerDto)
        .expect(HttpStatus.CONFLICT);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
