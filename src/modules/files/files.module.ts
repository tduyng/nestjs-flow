import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PublicFileService } from './services/public-file.service';
import { PublicFileRepository } from './repositories/public-file.repository';
import { S3Service } from './services/s3.service';
import { PrivateFileRepository } from './repositories/private-file.repository';
import { PrivateFileService } from './services/private-file.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PublicFileRepository, PrivateFileRepository]),
  ],
  providers: [PublicFileService, S3Service, PrivateFileService],
  exports: [PublicFileService, PrivateFileService],
})
export class FilesModule {}
