import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PublicFileRepository } from '../repositories/public-file.repository';

import { CreatePublicFileDto, DeletePublicFileDto } from '../dto';
import { S3PublicFileService } from './s3-public-file.service';
import { QueryRunner } from 'typeorm';
import { PublicFile } from '../public-file.entity';

@Injectable()
export class PublicFileService {
  constructor(
    @InjectRepository(PublicFileRepository)
    private readonly publicFileRepo: PublicFileRepository,
    private readonly s3PublicFileService: S3PublicFileService,
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
      const uploadResult = await this.s3PublicFileService.uploadResult(
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

  public async uploadPublicFileWithRunner(
    queryRunner: QueryRunner,
    dataBuffer: Buffer,
    filename: string,
  ) {
    try {
      const uploadResult = await this.s3PublicFileService.uploadResult(
        dataBuffer,
        filename,
      );
      const fileDto: CreatePublicFileDto = {
        key: uploadResult.Key,
        url: uploadResult.Location,
      };
      const newFile = queryRunner.manager.create(PublicFile, fileDto);
      await queryRunner.manager.save(newFile);

      return newFile;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  public async deletePublicFile(fileId: string) {
    const file = await this.getFileById(fileId);
    try {
      if (!file) {
        throw new NotFoundException('File not found');
      }
      const fileDto: DeletePublicFileDto = {
        key: file.key,
      };
      await this.s3PublicFileService.deleteFile(fileDto);

      return await this.publicFileRepo.deleteFile(fileId);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  public async deletePublicFileWithRunner(
    queryRunner: QueryRunner,
    fileId: string,
  ) {
    const file = await this.getFileById(fileId);
    try {
      if (!file) {
        throw new NotFoundException('File not found');
      }
      const fileDto: DeletePublicFileDto = {
        key: file.key,
      };
      await this.s3PublicFileService.deleteFile(fileDto);
      await queryRunner.manager.delete(PublicFile, fileId);
      return { deleted: true };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
