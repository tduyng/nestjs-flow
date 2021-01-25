export interface IPostSearchBody {
  id: string;
  title: string;
  content: string;
  authorId: string;
}

export interface IPostSearchResult {
  hits: {
    total: number;
    hits: Array<{
      _source: IPostSearchBody;
    }>;
  };
}

export interface IPostCountResult {
  count: number;
}

export const GET_POSTS_CACHE_KEY = 'GET_POSTS_CACHE';
