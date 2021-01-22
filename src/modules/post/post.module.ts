import { SearchModule } from '@modules/search/search.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostController } from './post.controller';
import { PostRepository } from './post.repository';
import { PostSearchService } from './services/post-search.service';
import { PostService } from './services/post.service';

@Module({
  imports: [TypeOrmModule.forFeature([PostRepository]), SearchModule],
  controllers: [PostController],
  providers: [PostService, PostSearchService],
})
export class PostModule {}
