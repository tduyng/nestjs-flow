import { Test, TestingModule } from '@nestjs/testing';
import { PrivateFile } from '../private-file.entity';
import { PrivateFileRepository } from '../repositories/private-file.repository';
import { PrivateFileService } from '../services/private-file.service';
import { S3Service } from '../services/s3.service';

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
  let s3Service;

  const mockPrivateFileRepo = () => ({
    createPrivateFile: jest.fn(),
  });

  const mockS3Service = () => ({
    uploadResult: jest.fn(),
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
          provide: S3Service,
          useFactory: mockS3Service,
        },
      ],
    }).compile();
    privateFileService = module.get<PrivateFileService>(PrivateFileService);
    privateFileRepository = module.get<PrivateFileRepository>(
      PrivateFileRepository,
    );
    s3Service = module.get<S3Service>(S3Service);
  });

  it('Should be defined', () => {
    expect(privateFileService).toBeDefined();
  });

  describe('uploadResult', () => {
    it('Should upload successfully file', async () => {
      privateFileRepository.createPrivateFile.mockReturnValue(oneFile);
      s3Service.uploadResult.mockReturnValue('object from uploadResult');

      const result = await privateFileService.uploadPrivateFile(
        {} as Buffer,
        'some ownerId',
        'some filename',
      );
      expect(result).toEqual(oneFile);
    });
  });
});
