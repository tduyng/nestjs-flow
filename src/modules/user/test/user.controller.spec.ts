import { UserController } from '../user.controller';
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../user.service';
import { User } from '../user.entity';
import { PublicFile } from '@modules/files/public-file.entity';
import { IRequestWithUser } from '@common/interfaces/http.interface';
import { CreateAddressDto } from '@modules/address/dto';
import { Address } from '@modules/address/address.entity';
import { PrivateFile } from '@modules/files/private-file.entity';

const userArray = [{ id: 'some userId' } as User];
const onePublicFile = { id: 'some fileId' } as PublicFile;

const req: IRequestWithUser = {
  user: {} as User,
};

const oneUser = {
  id: 'some userId',
  address: { id: 'some addressId' } as Address,
  avatar: {
    id: 'some avatarId',
  } as PublicFile,
} as User;

const onePrivateFile = { id: 'some fileId' } as PrivateFile;

const arrayPrivateFile = [{ id: 'some fileId' }] as PrivateFile[];

describe('UserController', () => {
  let userController: UserController;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            getUsers: jest.fn().mockReturnValue(userArray),
            addAvatar: jest.fn().mockReturnValue(onePublicFile),
            deleteAvatar: jest.fn().mockReturnValue({ deleted: true }),
            createUserAddress: jest.fn().mockReturnValue(oneUser),
            updateUserAddress: jest.fn().mockReturnValue(oneUser),
            deleteUserAddress: jest.fn().mockReturnValue({ deleted: true }),
            getPrivateFileFromAWS: jest.fn().mockReturnValue(Promise.resolve()),
            getAllPrivatesFileFromAWS: jest
              .fn()
              .mockReturnValue('array private files of user'),
            addPrivateFile: jest.fn().mockReturnValue(onePrivateFile),
            addMultiplePrivateFile: jest.fn().mockReturnValue(arrayPrivateFile),
            deletePrivateFile: jest.fn().mockReturnValue({ deleted: true }),
          },
        },
      ],
    }).compile();
    userController = module.get<UserController>(UserController);
  });

  it('Should be defined', () => {
    expect(userController).toBeDefined;
  });

  describe('getUsers', () => {
    it('Should return an array of user', async () => {
      expect(userController.getUsers()).resolves.toEqual(userArray);
    });
  });

  describe('addAvatar', () => {
    it('Should return a public file', async () => {
      const result = await userController.addAvatar(req, 'some @uploadfile');
      expect(result).toEqual(onePublicFile);
    });
  });

  describe('deleteAvatar', () => {
    it('Should delete successfully a public file', async () => {
      const result = await userController.deleteAvatar(req);
      expect(result).toEqual({ deleted: true });
    });
  });

  describe('addAddress', () => {
    it('Should add successfully an address to user', async () => {
      const result = await userController.updateAddress(
        req,
        {} as CreateAddressDto,
      );
      expect(result).toEqual(oneUser);
    });
  });

  describe('deleteAddress', () => {
    it('Should deleted successfully', async () => {
      const result = await userController.deleteAddress(req);
      expect(result).toEqual({ deleted: true });
    });
  });

  describe('getAllUserFilesFromAWS', () => {
    it('Should return an array files of user', async () => {
      const result = await userController.getAllUserFilesFromAWS(req);
      expect(result).toEqual('array private files of user');
    });
  });

  describe('addFile', () => {
    it('Should return a private file', async () => {
      const result = await userController.addFile(req, 'some @uploadfile');
      expect(result).toEqual(onePrivateFile);
    });
  });

  describe('addMultipleFiles', () => {
    it('Should return an array of private files', async () => {
      const uploadFiles = [
        {
          dataBuffer: {} as Buffer,
          filename: 'some filename',
        },
      ];
      const result = await userController.addMultipleFiles(req, uploadFiles);
      expect(result).toEqual(arrayPrivateFile);
    });
  });

  describe('deletePrivateFile', () => {
    it('Should deleted private file successfully', async () => {
      const result = await userController.deleteFile(req, 'some fileId');
      expect(result).toEqual({ deleted: true });
    });
  });
});
