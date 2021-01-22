import { IPayloadJwt } from '../auth.interface';
import { Injectable } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthRepository } from '../auth.repository';

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh-token',
) {
  constructor(
    @InjectRepository(AuthRepository)
    private readonly authRepository: AuthRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          return req?.cookies?.Refresh;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_REFRESH_TOKEN_SECRET,
      passReqToCallback: true,
    });
  }
  public async validate(req: Request, payload: IPayloadJwt) {
    const refreshToken = req.cookies?.Refresh;
    return this.authRepository.getUserIfRefreshTokenMatches(
      refreshToken,
      payload.userId,
    );
  }
}
