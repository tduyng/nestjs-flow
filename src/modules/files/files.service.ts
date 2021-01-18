import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import PublicFile from './public-file.entity';
import { PublicFileRepository } from './public-file.repository';
import { S3 } from 'aws-sdk';
import { v4 as uuid } from 'uuid';
import { CreatePublicFileDto } from './dto';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(PublicFile)
    private readonly publicFileRepo: PublicFileRepository,
  ) {}

  public async uploadPublicFile(dataBuffer: Buffer, filename: string) {
    const s3 = new S3();
    const uploadResult = await s3
      .upload({
        Bucket: process.env.AWS_PUBLIC_BUCKET_NAME,
        Body: dataBuffer,
        Key: `${uuid()}-${filename}`,
      })
      .promise();

    const fileDto: CreatePublicFileDto = {
      key: uploadResult.Key,
      url: uploadResult.Location,
    };
    const newFile = await this.publicFileRepo.createPublicFile(fileDto);
    return newFile;
  }

  public async deletePublicFile(fileId: string) {
    const file = await this.publicFileRepo.getFileById(fileId);
    const s3 = new S3();
    await s3
      .deleteObject({
        Bucket: process.env.AWS_PUBLIC_BUCKET_NAME,
        Key: file.key,
      })
      .promise();

    await this.publicFileRepo.deleteFile(fileId);
  }
}
