import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePrivateFileDto } from '../dto/create-private-file.dto';
import { PrivateFileRepository } from '../repositories/private-file.repository';
import { S3Service } from './s3.service';

@Injectable()
export class PrivateFileService {
  constructor(
    @InjectRepository(PrivateFileRepository)
    private privateFileRepo: PrivateFileRepository,
    private s3Service: S3Service,
  ) {}
  public async uploadPrivateFile(
    dataBuffer: Buffer,
    ownerId: string,
    filename: string,
  ) {
    try {
      const uploadResult = await this.s3Service.uploadResult(
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
}
