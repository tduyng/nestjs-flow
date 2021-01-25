import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './comment.entity';
import { CqrsModule } from '@nestjs/cqrs';
import CommentController from './comment.controller';
import { CreateCommentHandler } from './commands/handlers/create-command.handler';
import { GetCommentsHandler } from './queries/handlers/get-comments.handler';

@Module({
  imports: [TypeOrmModule.forFeature([Comment]), CqrsModule],
  controllers: [CommentController],
  providers: [CreateCommentHandler, GetCommentsHandler],
})
export class CommentModule {}
