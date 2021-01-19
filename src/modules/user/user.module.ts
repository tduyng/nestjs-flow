import { FilesModule } from '@modules/files/files.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserRepository]), FilesModule],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
