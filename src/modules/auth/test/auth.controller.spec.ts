import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { AuthController } from '../auth.controller';
import { RegisterUserDto } from '../dto';
import { IRequestWithUser } from '@common/interfaces/http.interface';
import { User } from '@modules/user/user.entity';

const registerDto: RegisterUserDto = {
  email: 'some',
  password: 'some',
};
const oneUser = {
  email: 'some',
  password: 'some',
} as User;

describe('AuthController', () => {
  let authController: AuthController;
  let authService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            registerUser: jest.fn().mockReturnValue(oneUser),
            validateUser: jest.fn().mockReturnValue(oneUser),
            getCookieWithToken: jest.fn().mockReturnValue('some token cookie'),
            getCookieWithJwtRefreshToken: jest
              .fn()
              .mockReturnValue({ cookie: 'some cookie', token: 'some token' }),
            getAuthenticatedUser: jest.fn().mockReturnValue(oneUser),
            setHeaderSingle: jest.fn(),
            setHeaderArray: jest.fn(),
            clearCookie: jest.fn(),
            setCurrentRefreshToken: jest.fn(),
            removeRefreshToken: jest.fn(),
          },
        },
      ],
    }).compile();
    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('Register user route', () => {
    it('Should return an user', async () => {
      const result = authController.register(registerDto);
      expect(result).resolves.toEqual(oneUser);
    });
  });

  describe('Login user route', () => {
    it('Should return an user', async () => {
      const userFake = oneUser as User;
      const req: IRequestWithUser = {
        user: userFake,
      };
      const result = await authController.login(req);
      expect(authService.setHeaderArray).toHaveBeenCalled();
      expect(result).toEqual(oneUser);
    });
  });

  describe('Logout route', () => {
    it('Should call logout successfully', async () => {
      const req: IRequestWithUser = {
        user: {} as User,
      };
      const result = await authController.logout(req);
      expect(result).toEqual({ logout: true });
    });
  });

  describe('Get auth user route', () => {
    it('Should return an user', async () => {
      const userFake = oneUser as User;
      const req: IRequestWithUser = {
        user: userFake,
      };
      const result = await authController.getAuthenticatedUser(req);
      expect(result).toEqual(oneUser);
    });
  });

  describe('refresh route', () => {
    it('Should return an user with new access token', () => {
      const userFake = oneUser as User;
      const req: IRequestWithUser = {
        user: userFake,
      };
      const result = authController.refreshToken(req);
      expect(authService.setHeaderSingle).toHaveBeenCalled();
      expect(authService.getCookieWithToken).toHaveBeenCalled();
      expect(result).toEqual(oneUser);
    });
  });
});
