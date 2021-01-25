import { PostModule } from '@modules/post/post.module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ormConfig } from '@common/config/ormConfig';
import { UserModule } from '@modules/user/user.module';
import { AuthModule } from '@modules/auth/auth.module';
import { CategoryModule } from '@modules/category/category.module';
import { AddressModule } from '@modules/address/address.module';
import { FilesModule } from '@modules/files/files.module';
import { MulterModule } from '@nestjs/platform-express';
import { SubscriberModule } from '@modules/subscriber/subscriber.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot(ormConfig()),
    MulterModule.register({
      dest: 'src/common/upload',
    }),
    PostModule,
    UserModule,
    AddressModule,
    AuthModule,
    CategoryModule,
    FilesModule,
    AddressModule,
    SubscriberModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
