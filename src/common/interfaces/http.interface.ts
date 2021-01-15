import { User } from '@modules/user/user.entity';
import { Response } from 'express';

export interface IRequestWithUser {
  user?: User;
  res?: Response;
}
