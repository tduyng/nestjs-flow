import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { Post } from '../post.entity';
import {
  IPostCountResult,
  IPostSearchBody,
  IPostSearchResult,
} from '../types/post.interface';

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

  public async count(query: string, fields: string[]): Promise<number> {
    const { body } = await this.esService.count<IPostCountResult>({
      index: this._index,
      body: {
        query: {
          multi_match: {
            query,
            fields,
          },
        },
      },
    });
    return body.count;
  }

  public async search(
    text: string,
    offset?: number,
    limit?: number,
    startId?: string,
  ) {
    try {
      let separateCount = 0;
      if (startId) {
        separateCount = await this.count(text, ['title', 'paragraphs']);
      }

      const { body } = await this.esService.search<IPostSearchResult>({
        index: this._index,
        from: offset,
        size: limit,
        body: {
          query: {
            bool: {
              should: {
                multi_match: {
                  query: text,
                  fields: ['title', 'paragraphs'],
                },
              },
              filter: {
                range: {
                  id: {
                    gt: startId,
                  },
                },
              },
            },
          },
          sort: {
            createdAt: {
              order: 'asc',
            },
          },
        },
      });
      const count = body?.hits?.total;
      const hits = body?.hits?.hits;
      const results = hits?.map((item) => item._source) || [];
      return {
        count: startId ? separateCount : count,
        results,
      };
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
