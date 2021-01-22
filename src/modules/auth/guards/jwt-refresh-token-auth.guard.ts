import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtRefreshTokenAuthGuard extends AuthGuard('jwt-refresh-token') {}
