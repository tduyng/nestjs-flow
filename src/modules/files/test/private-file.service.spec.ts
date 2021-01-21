import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrivateFile } from '../private-file.entity';
import { PrivateFileRepository } from '../repositories/private-file.repository';
import { PrivateFileService } from '../services/private-file.service';
import { S3PrivateFileService } from '../services/s3-private-file.service';

const oneFile = {
  id: 'some id',
  key: 'some key',
  owner: {
    id: 'some ownerId',
  },
} as PrivateFile;

describe('PrivateFileService', () => {
  let privateFileService: PrivateFileService;
  let privateFileRepository;
  let s3PrivateFileService;

  const mockPrivateFileRepo = () => ({
    getFileById: jest.fn(),
    createPrivateFile: jest.fn(),
    deleteFile: jest.fn(),
  });

  const mockS3PrivateFileService = () => ({
    uploadResult: jest.fn(),
    deleteFile: jest.fn(),
  });

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrivateFileService,
        {
          provide: PrivateFileRepository,
          useFactory: mockPrivateFileRepo,
        },
        {
          provide: S3PrivateFileService,
          useFactory: mockS3PrivateFileService,
        },
      ],
    }).compile();
    privateFileService = module.get<PrivateFileService>(PrivateFileService);
    privateFileRepository = module.get<PrivateFileRepository>(
      PrivateFileRepository,
    );
    s3PrivateFileService = module.get<S3PrivateFileService>(
      S3PrivateFileService,
    );
  });

  it('Should be defined', () => {
    expect(privateFileService).toBeDefined();
  });

  describe('getFileById', () => {
    it('Should return an error when file not found', async () => {
      privateFileRepository.getFileById.mockReturnValue(null);
      try {
        await privateFileService.getFileById('some id');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });
    it('Should return a private file', async () => {
      privateFileRepository.getFileById.mockReturnValue(oneFile);
      const result = await privateFileService.getFileById('some id');
      expect(result).toEqual(oneFile);
    });
  });

  describe('uploadResult', () => {
    it('Should upload successfully file', async () => {
      privateFileRepository.createPrivateFile.mockReturnValue(oneFile);
      s3PrivateFileService.uploadResult.mockReturnValue(
        'object from uploadResult',
      );

      const result = await privateFileService.uploadPrivateFile(
        'some ownerId',
        {} as Buffer,
        'some filename',
      );
      expect(result).toEqual(oneFile);
    });
  });

  describe('deleteFile', () => {
    it('Should return an error when file not found', async () => {
      privateFileRepository.getFileById.mockReturnValue(null);
      try {
        await privateFileService.deletePrivateFile('some id');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });
    it('Should delete file successfully', async () => {
      privateFileRepository.getFileById.mockReturnValue(oneFile);
      privateFileRepository.deleteFile.mockReturnValue({ deleted: true });
      s3PrivateFileService.deleteFile.mockReturnValue({ deleted: true });
      const result = await privateFileService.deletePrivateFile('some id');
      expect(result).toEqual({ deleted: true });
    });
  });
});
