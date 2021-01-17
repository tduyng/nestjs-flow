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
const user = {
  email: 'some',
  password: 'some',
};

describe('AuthController', () => {
  let authController: AuthController;
  let authService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            registerUser: jest.fn().mockReturnValue(user),
            validateUser: jest.fn().mockReturnValue(user),
            getCookieWithToken: jest.fn().mockReturnValue('some token'),
            getAuthenticatedUser: jest.fn().mockReturnValue(user),
            setHeader: jest.fn(),
            clearCookie: jest.fn(),
          },
        },
      ],
    }).compile();
    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('Register user route', () => {
    it('Should return an user', async () => {
      await expect(authController.register(registerDto)).resolves.toEqual(user);
    });
  });

  describe('Login user route', () => {
    it('Should return an user', async () => {
      const userFake = user as User;
      const req: IRequestWithUser = {
        user: userFake,
      };
      const result = await authController.login(req);
      expect(authService.setHeader).toHaveBeenCalled();
      expect(result).toEqual(user);
    });
  });

  describe('Logout route', () => {
    it('Should call logout successfully', async () => {
      const req: IRequestWithUser = {
        user: {} as User,
      };
      expect(authController.logout(req)).toEqual({ logout: true });
    });
  });

  describe('Get auth user route', () => {
    it('Should return an user', async () => {
      const userFake = user as User;
      const req: IRequestWithUser = {
        user: userFake,
      };
      const result = await authController.getAuthenticatedUser(req);
      expect(result).toEqual(user);
    });
  });
});
