import { User } from '@modules/user/user.entity';

export interface IRequestWithUser {
  user?: User;
}
