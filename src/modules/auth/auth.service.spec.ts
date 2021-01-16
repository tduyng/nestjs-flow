import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let authService;
  // let jwtService;
  // let authRepository;

  const mockUserRepository = () => ({
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
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
    // authRepository = module.get<AuthRepository>(AuthRepository);
  });

  it('Should be defined', () => {
    expect(authService).toBeDefined();
  });
});
