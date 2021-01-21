import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePrivateFileDto } from '../dto/create-private-file.dto';
import { DeletePrivateFileDto } from '../dto/delete-private-file.dto';
import { PrivateFileRepository } from '../repositories/private-file.repository';
import { S3PrivateFileService } from './s3-private-file.service';
import { v4 as uuid } from 'uuid';
import { UploadFileDto } from '../dto';

@Injectable()
export class PrivateFileService {
  constructor(
    @InjectRepository(PrivateFileRepository)
    private privateFileRepo: PrivateFileRepository,
    private s3PrivateFileService: S3PrivateFileService,
  ) {}

  public async getFileById(id: string) {
    try {
      const file = await this.privateFileRepo.getFileById(id);
      if (!file) {
        throw new NotFoundException('File not found');
      }
      return file;
    } catch (error) {
      if (error.status === HttpStatus.NOT_FOUND) {
        throw error;
      }
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }
  public async uploadPrivateFile(
    ownerId: string,
    dataBuffer: Buffer,
    filename: string,
  ) {
    try {
      const uploadResult = await this.s3PrivateFileService.uploadResult(
        dataBuffer,
        filename,
      );
      const fileDto: CreatePrivateFileDto = {
        key: uploadResult.Key,
        owner: {
          id: ownerId,
        },
      };
      const newFile = await this.privateFileRepo.createPrivateFile(fileDto);
      return newFile;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  public async uploadMultiplePrivateFile(
    ownerId: string,
    uploadFiles: UploadFileDto[],
  ) {
    try {
      const resultFiles = [];
      for (const upload of uploadFiles) {
        const uploadResult = await this.s3PrivateFileService.uploadResult(
          upload.dataBuffer,
          upload.filename,
        );
        const fileDto: CreatePrivateFileDto = {
          key: uploadResult.Key,
          owner: {
            id: ownerId,
          },
        };
        const newFile = await this.privateFileRepo.createPrivateFile(fileDto);
        resultFiles.push(newFile);
      }

      return resultFiles;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  public async deletePrivateFile(fileId: string) {
    const file = await this.getFileById(fileId);
    try {
      const fileDto: DeletePrivateFileDto = {
        key: file.key,
      };
      await this.s3PrivateFileService.deleteFile(fileDto);

      return await this.privateFileRepo.deleteFile(fileId);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /* Test upload directly, not passing AWS S3 */
  public async testUploadFileWithoutAWS(
    ownerId: string,
    dataBuffer: Buffer,
    filename: string,
  ) {
    try {
      const key = `${uuid()}-${filename}`;
      const fileDto: CreatePrivateFileDto = {
        key: key,
        owner: {
          id: ownerId,
        },
      };
      const newFile = await this.privateFileRepo.createPrivateFile(fileDto);
      return newFile;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  public async testUploadMultipleFilesWithoutAWS(
    ownerId: string,
    uploadFiles: UploadFileDto[],
  ) {
    try {
      const resultFiles = [];
      for (const upload of uploadFiles) {
        const key = `${uuid()}-${upload.filename}`;
        const fileDto: CreatePrivateFileDto = {
          key: key,
          owner: {
            id: ownerId,
          },
        };
        const newFile = await this.privateFileRepo.createPrivateFile(fileDto);
        resultFiles.push(newFile);
      }

      return resultFiles;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  public async testDeletePrivateFileWithoutAWS(fileId: string) {
    try {
      return await this.privateFileRepo.deleteFile(fileId);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
