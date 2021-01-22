import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { Post } from '../post.entity';
import { IPostSearchBody, IPostSearchResult } from '../post.interface';

@Injectable()
export class PostSearchService {
  private readonly _index = 'posts';
  constructor(private readonly esService: ElasticsearchService) {}

  public async indexPost(post: Post) {
    try {
      const result = await this.esService.index<
        IPostSearchResult,
        IPostSearchBody
      >({
        index: this._index,
        body: {
          id: post.id,
          title: post.title,
          content: post.content,
          authorId: post.author.id,
        },
      });
      return result;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  public async search(text: string) {
    try {
      const { body } = await this.esService.search<IPostSearchResult>({
        index: this._index,
        body: {
          query: {
            multi_match: {
              query: text,
              fields: ['title', 'content'],
            },
          },
        },
      });
      const hits = body?.hits?.hits;
      const result = hits?.map((item) => item._source) || [];
      return result;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  public async remove(postId: string) {
    try {
      await this.esService.deleteByQuery({
        index: this._index,
        body: {
          query: {
            match: {
              id: postId,
            },
          },
        },
      });
      return {
        deleted: true,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  public async update(post: Post) {
    try {
      const newBody: IPostSearchBody = {
        id: post.id,
        title: post.title,
        content: post.content,
        authorId: post.author.id,
      };

      const script = Object.entries(newBody).reduce((result, [key, value]) => {
        return `${result} ctx._source.${key}='${value}';`;
      }, '');
      // ctx._source.title='New title'; ctx._source.content= 'New content';
      const result = await this.esService.updateByQuery({
        index: this._index,
        body: {
          query: {
            match: {
              id: post.id,
            },
          },
          script: {
            inline: script,
          },
        },
      });
      return result;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // public async update(post: Post) {
  //   await this.remove(post.id);
  //   await this.indexPost(post);
  // }
}
