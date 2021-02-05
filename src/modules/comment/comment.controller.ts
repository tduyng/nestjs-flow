import { IRequestWithUser } from '@common/global-interfaces/http.interface';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateCommentCommand } from './commands/implementations/create-command.command';
import { CreateCommentDto, GetCommentsDto } from './dto';
import { GetCommentsQuery } from './queries/implementations/get-comments.query';

@Controller('comments')
@UseInterceptors(ClassSerializerInterceptor)
export default class CommentController {
  constructor(private commandBus: CommandBus, private queryBus: QueryBus) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  public async createComment(
    @Body() commentDto: CreateCommentDto,
    @Req() req: IRequestWithUser,
  ) {
    const { user } = req;
    return this.commandBus.execute(new CreateCommentCommand(commentDto, user));
  }

  @Get()
  public async getComments(@Query() { postId }: GetCommentsDto) {
    return this.queryBus.execute(new GetCommentsQuery(postId));
  }
}
