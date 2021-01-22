import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalStrategy } from './strategies/local.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthRepository } from './auth.repository';
import { ConfigModule } from '@nestjs/config';
import { JwtRefreshTokenStrategy } from './strategies/jwt-refresh-token.strategy';
@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forFeature([AuthRepository]),
    PassportModule,
    JwtModule.register({}),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy, JwtRefreshTokenStrategy],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
