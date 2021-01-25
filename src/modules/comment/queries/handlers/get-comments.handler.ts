import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetCommentsQuery } from '../implementations/get-comments.query';
import { Comment } from '../../comment.entity';

@QueryHandler(GetCommentsQuery)
export class GetCommentsHandler implements IQueryHandler<GetCommentsQuery> {
  constructor(
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
  ) {}

  async execute(query: GetCommentsQuery) {
    if (query.postId) {
      return this.commentsRepository.find({
        where: {
          post: {
            id: query.postId,
          },
        },
      });
    }
    return this.commentsRepository.find();
  }
}
