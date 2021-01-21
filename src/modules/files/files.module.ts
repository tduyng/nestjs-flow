import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PublicFileService } from './services/public-file.service';
import { PublicFileRepository } from './repositories/public-file.repository';
import { S3PublicFileService } from './services/s3-public-file.service';
import { PrivateFileRepository } from './repositories/private-file.repository';
import { PrivateFileService } from './services/private-file.service';
import { S3PrivateFileService } from './services/s3-private-file.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PublicFileRepository, PrivateFileRepository]),
  ],
  providers: [
    PublicFileService,
    PrivateFileService,
    S3PublicFileService,
    S3PrivateFileService,
  ],
  exports: [PublicFileService, PrivateFileService],
})
export class FilesModule {}
