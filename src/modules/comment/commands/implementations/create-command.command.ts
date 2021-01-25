import { User } from '@modules/user/user.entity';
import { CreateCommentDto } from '../../dto';

export class CreateCommentCommand {
  constructor(
    public readonly comment: CreateCommentDto,
    public readonly author: User,
  ) {}
}
