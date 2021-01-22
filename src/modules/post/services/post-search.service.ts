import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { Post } from '../post.entity';
import { IPostSearchBody, IPostSearchResult } from '../post.interface';

@Injectable()
export class PostSearchService {
  private readonly _index = 'posts';
  constructor(private readonly esService: ElasticsearchService) {}

  // public get index() {
  //   return this._index;
  // }

  public async indexPost(post: Post) {
    return this.esService.index<IPostSearchResult, IPostSearchBody>({
      index: this._index,
      body: {
        id: post.id,
        title: post.title,
        content: post.content,
        authorId: post.author.id,
      },
    });
  }

  public async search(text: string) {
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
    const hits = body.hits.hits;
    return hits.map((item) => item._source);
  }

  public async remove(postId: string) {
    this.esService.deleteByQuery({
      index: this._index,
      body: {
        query: {
          match: {
            id: postId,
          },
        },
      },
    });
  }

  public async update(post: Post) {
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
    return this.esService.updateByQuery({
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
  }

  // public async update(post: Post) {
  //   await this.remove(post.id);
  //   await this.indexPost(post);
  // }
}
