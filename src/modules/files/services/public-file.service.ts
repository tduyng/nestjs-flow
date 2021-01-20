import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PublicFileRepository } from '../public-file.repository';

import { CreatePublicFileDto, DeletePublicFileDto } from '../dto';
import { S3Service } from './s3.service';

@Injectable()
export class PublicFileService {
  constructor(
    @InjectRepository(PublicFileRepository)
    private readonly publicFileRepo: PublicFileRepository,
    private readonly s3Service: S3Service,
  ) {}

  public async getFileById(id: string) {
    try {
      const file = this.publicFileRepo.getFileById(id);
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

  public async uploadPublicFile(dataBuffer: Buffer, filename: string) {
    try {
      const uploadResult = await this.s3Service.uploadResult(
        dataBuffer,
        filename,
      );
      const fileDto: CreatePublicFileDto = {
        key: uploadResult.Key,
        url: uploadResult.Location,
      };
      const newFile = await this.publicFileRepo.createPublicFile(fileDto);
      return newFile;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  public async deletePublicFile(fileId: string) {
    try {
      const file = await this.publicFileRepo.getFileById(fileId);
      if (!file) {
        throw new NotFoundException('File not found');
      }
      const fileDto: DeletePublicFileDto = {
        key: file.key,
      };
      await this.s3Service.deleteFile(fileDto);

      return await this.publicFileRepo.deleteFile(fileId);
    } catch (error) {
      if (error.status === HttpStatus.NOT_FOUND) {
        throw error;
      } else {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
}
