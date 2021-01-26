# Nestjs caching

## 15.1 Implementing in-memory cache


Check the code at branch [15-in-memory-cache](https://gitlab.com/tienduy-nguyen/nestjs-flow/-/tree/15-in-memory-cache)

Check awesome article of Wanago about this part:
- [Implementing in-memory cache](https://wanago.io/2021/01/04/api-nestjs-in-memory-cache-performance/)


There are quite a few things we can do when tackling our application’s performance. We sometimes can make our code faster and optimize the database queries. To make our API even more performing, we might want to completely avoid running some of the code.

Accessing the data stored in the database is quite often time-consuming. It adds up if we also perform some data manipulation on top of it before returning it to the user. Fortunately, we can improve our approach with caching. By storing a copy of the data in a way that it can be served faster, we can speed up the response in a significant way.

The most straightforward way to implement cache is to store the data in the memory of our application. Under the hood, NestJS uses the [cache-manager library](https://github.com/BryanDonovan/node-cache-manager#readme).

- We need to start by installing it.
  ```bash
  $ yarn add cache-manager
  ```
- To enable the cache, we need to import the CacheModule in our app.
  ```diff
  // post.module.ts
  // ...
  @Module({
    imports: [
  +   CacheModule.register({
  +     ttl: 120
  +   }),
      TypeOrmModule.forFeature([Post]),
      SearchModule,
    ],
    controllers: [PostsController],
    providers: [PostsService, PostsSearchService],
  })
  export class PostsModule {}

  ```

- By default, the amount of time that a response is cached before deleting it is 5 seconds. Also, the maximum number of elements in the cache is 100 by default. We can change those values by passing additional options to the CacheModule.register() method.

  ```ts
  CacheModule.register({
    ttl: 5,
    max: 100
  });
  ```
### Automatically caching responses

- NestJS comes equipped with the CacheInterceptor. With it, NestJS handles the cache automatically.
  ```ts
  // post.controller.ts
  import {
    Controller,
    Get,
    UseInterceptors,
    ClassSerializerInterceptor,
    Query, CacheInterceptor,
  } from '@nestjs/common';
  import PostsService from './posts.service';
  import { PaginationParams } from '../utils/types/paginationParams';

  @Controller('posts')
  @UseInterceptors(ClassSerializerInterceptor)
  export default class PostsController {
    constructor(
      private readonly postsService: PostsService
    ) {}

    @UseInterceptors(CacheInterceptor)
    @Get()
    async getPosts(
      @Query('search') search: string,
      @Query() { offset, limit, startId }: PaginationParams
    ) {
      if (search) {
        return this.postsService.searchForPosts(search, offset, limit, startId);
      }
      return this.postsService.getAllPosts(offset, limit, startId);
    }
    // ...
  }
  ```

  If we call this endpoint two times, NestJS does not invoke the `getPosts` method twice. Instead, it returns the cached data the second time.

  In the part 10 of this series, we’ve integrated Elasticsearch into our application. Also, in the part 12, we’ve added pagination. Therefore, our `/posts` endpoint accepts quite a few query params.

  A very important thing that the [official documentation](https://docs.nestjs.com/techniques/caching) does not mention is that NestJS will store the response of the `getPosts` method separately for every combination of query params. Thanks to that, calling `/posts?search=Hello` and `/posts?search=World` can yield different responses.

  Although above, we use `CacheInterceptor` for a particular endpoint, we can also use it for the whole controller. We could even use it for a whole module. Using cache might sometimes cause us to return stale data, though. Therefore, we need to be careful about what endpoint do we cache.

### Using caching store manually
- Aside from using the automatic cache, we can also interact with the cache manually. Let’s inject it into our service.
  ```ts
  import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
  import Post from './post.entity';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository } from 'typeorm';
  import PostsSearchService from './postsSearch.service';

  @Injectable()
  export default class PostsService {
    constructor(
      @InjectRepository(Post)
      private postsRepository: Repository<Post>,
      private postsSearchService: PostsSearchService,
      @Inject(CACHE_MANAGER) private cacheManager: Cache
    ) {}

    // ...

  }
  ```

  An important concept to grasp is that the cache manager provides a key-value store. We can:

  - retrieve the values using the `cacheManager.get('key')` method,
  - add items using `cacheManager.set('key', 'value)`,
  - remove elements with `cacheManager.del('key')`,
  - clear the whole cache using `cacheManager.reset()`.

  It can come in handy for more sophisticated cases. We can even use it together with the automatic cache.

### Invalidating cache


**Missing docs for this part. Working in progress....**

---

## 15.2 Caching with Redis


Check the code at branch [15-redis](https://gitlab.com/tienduy-nguyen/nestjs-flow/-/tree/15-redis)

Check awesome article of Wanago about this part:
- [Caching with Redis](https://wanago.io/2021/01/11/nestjs-cache-redis-node-js-cluster/)


**Missing docs for this part. Working in progress....**
