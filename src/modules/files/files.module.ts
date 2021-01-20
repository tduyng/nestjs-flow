import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PublicFileService } from './services/public-file.service';
import { PublicFileRepository } from './public-file.repository';
import { S3Service } from './services/s3.service';

@Module({
  imports: [TypeOrmModule.forFeature([PublicFileRepository])],
  providers: [PublicFileService, S3Service],
  exports: [PublicFileService],
})
export class FilesModule {}
