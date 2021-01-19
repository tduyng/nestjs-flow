import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilesService } from './services/files.service';
import { PublicFileRepository } from './repositories/public-file.repository';
import { S3Service } from './services/s3.service';

@Module({
  imports: [TypeOrmModule.forFeature([PublicFileRepository])],
  providers: [FilesService, S3Service],
  exports: [FilesService],
})
export class FilesModule {}
