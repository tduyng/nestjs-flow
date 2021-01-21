## 1. Init project

Check the code at branch [1-init-project](https://gitlab.com/tienduy-nguyen/nestjs-flow/-/tree/1-init-project)
### Installation

Install [Nest CLI](https://docs.nestjs.com/cli/overview)
  ```bash
  $ yarn global add @nestjs/cli
  $ nest new project-name
  ```

  or alternatively, to install the TypeScript project wiht **Git**:
  ```bash
  $ git clone https://github.com/nestjs/typescript-starter.git project
  $ cd project
  $ npm install
  $ npm run start
  ```

  Check [Nestjs documentations for more details](https://docs.nestjs.com/)

**Start coding**
### Bootstrap projects
- Init project with **Nest CLI**
  ```bash
  $ nest new nestjs-flow
  $ cd nestjs-flow
  ```

  When all done, we will have a structure project:

  ```tree
    .
  ├── nest-cli.json
  ├── package.json
  ├── README.md
  ├── src
  │   ├── app.controller.spec.ts
  │   ├── app.controller.ts
  │   ├── app.module.ts
  │   ├── app.service.ts
  │   └── main.ts
  ├── test
  │   ├── app.e2e-spec.ts
  │   └── jest-e2e.json
  ├── tsconfig.build.json
  ├── tsconfig.json
  └── yarn.lock
  ```

  Check the [Nest documentation](https://docs.nestjs.com/), you will have a very good explain about structure, about each files & understand how it works.

  **Note:** when you create project with **Nest cli**, it will be automatically include a file `.git` in the root folder. Consider delete it with `rm -rf .git` if you have already another `.git`.

  **Note2:** if you create Nestjs as a subfolder in your project (as microservice eg), you will have some problem with **eslint** syntax. **To fix that**, update `tsconfigRootDir: __dirname` in `.eslint.js` file

  ```diff
  //.eslintrc.js
    parserOptions: {
      project: 'tsconfig.json',
  +  tsconfigRootDir: __dirname,
      sourceType: 'module',
    },
  ```

- Start server
  Run `yarn start:dev` to start server. Check all scripts availables in `package.json` file.

- Custom port server
  Default port of server nest js: `3000`, you can change it as you cant in `main.ts`. Here, I use port `1776`:
  ```ts
  //main.ts
  import { NestFactory } from '@nestjs/core';
  import { AppModule } from './app.module';

  async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    await app.listen(1776, () => {
      console.log(`Server is running at http://localhost:1776/`);
    });
  }
  bootstrap();

  ```
### Using variable environment (.env)

If you are familiar with Nodejs, you may be sûre already know `dotenv` package to manage variable environment (secret variable) in `.env` files.

Nest JS also help us to handle that with `@nestjs/config`.

- Install
  Add to the DevDependencies
  ```bash
  $ yarn add -D @nestjs/config
  ```
- Setup
  We will import the `ConfigModule` in `app.modules.ts`:
  ```ts
  //app.module.ts
  import { Module } from '@nestjs/common';
  import { ConfigModule } from '@nestjs/config';

  @Module({
    imports: [ConfigModule.forRoot()],
  })
  export class AppModule {}
  ```
  `ConfigModule` is setup global (for all files) by default. You can customize to more readable:

  ```ts
  // app.module.ts
  ...
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ...
  ],
  ...
  ```

  Then, when server started, the config will initialize automatically.
- How it works
  The principe of `@nest/config` is the same as `dotenv`. That means we can use `process.env` to call the variable.

  ex: in the `.env` file we have:
  ```.env
  DATABASE_USER=test
  DATABASE_PASSWORD=test
  ```
  ==> use `process.env.DATABASE_USER` , `process.env.DATABASE_PASSWORD`

- To better use process.env variables, we will create a global declaration type file.

  Create `node.d.ts` file to declare Nodejs type in `src/common/types` folder and add the variables you declare in your `.env` files

  ```
  # .env file
  SERVER_PORT=1776
  ROUTE_GLOBAL_PREFIX=api
  JWT_SECRET=justanotherkey

  # Typeorm
  TYPEORM_CONNECTION = postgres
  TYPEORM_HOST = postgres
  TYPEORM_USERNAME = postgres
  TYPEORM_PASSWORD = postgres
  TYPEORM_DATABASE = test_db
  TYPEORM_PORT = 5432

  TYPEORM_ENTITIES = [src/modules/**/*.entity.ts]
  TYPEORM_MIGRATIONS=[src/common/migrations/**/*.ts]
  TYPEORM_MIGRATIONS_DIR=src/common/migrations
  ```


  ```ts
  // src/common/types/node.d.ts
  declare namespace NodeJS {
    interface ProcessEnv {
      readonly NODE_ENV: 'development' | 'production' | 'test';
      readonly SERVER_PORT: string;
      readonly TYPEORM_CONNECTION: string;
      readonly TYPEORM_HOST: string;
      readonly TYPEORM_USERNAME: string;
      readonly TYPEORM_PASSWORD: string;
      readonly TYPEORM_DATABASE: string;
      readonly TYPEORM_PORT: string;
      readonly TYPEORM_LOGGING: string;
      readonly TYPEORM_ENTITIES: string;
      readonly TYPEORM_MIGRATIONS: string;
      readonly ROUTE_GLOBAL_PREFIX: string;
      readonly JWT_SECRET: string;
      readonly TWO_FACTOR_AUTHENTICATION_APP_NAME: string;
    }
  }

  ```

  And update your tsconfig.json files:
  ```json
  "typeRoots": [
      "./node_modules/@types",
      "src/common/types"
    ],
  ```

  So, now, each time you call `process.env`, all variables environments will be suggested.


  For more details check on [Nest configuration](https://docs.nestjs.com/techniques/configuration).


### Modules

In the template create by **Nest cli**, there are not many thing to do with. So, we will create a simple api blog to understand easier how NestJS work.

I recommend structure src project as:
```tree
├── src
│   ├── app
│   │   ├── app.controller.spec.ts
│   │   ├── app.controller.ts
│   │   ├── app.module.ts
│   │   └── app.service.ts
│   ├── common
│   │   ├── config
│   │   └── types
│   │       └── node.d.ts
│   ├── main.ts
│   └── modules
│       ├── auth
│       ├── post
│       └── user
```

- **app**: contains all files of app modules
- **common**: contains common or shared files as types, config, migration, data, interface general ...
- **modules**: container where  contains all files of each modules of project. ex: User module, auth module, post module ...

This structure will help you better organize your codes & adapt with principle of Nest framework. If you follow this series, you will understand better why I prefer this structure.

#### Post modules
- Getting started
  Docs of **Nest** is very well structure and excellent explain all techniques & theirs features. So I will not go deep to explain each one.
  When you read my codes, if you don't understand some parts, you can check for more details:
  - [Controllers](https://docs.nestjs.com/controllers): where you put your routes
  - [Providers](https://docs.nestjs.com/providers): services files contains methods to connect with methods of repository (database), it help use to separate business logic from controllers
  - [Modules](https://docs.nestjs.com/modules): combine of controllers & providers to export


- Create `PostService`
  For the first step, we will create a simple Post module. We will not use the database now and we use the fake array instead.
  - Add package `uuid` to create fake **id**
    ```bash
    $ yarn add -D uuid
    ```
  - Create folder `src/modules/post`
  - Create `post.interface.service` for **post model**
    ```ts
    // post.interface.ts
    export interface Post {
      id: string;
      title: string;
      content: string;
    }

    ```
  - Create `src/post/dto`: data transfer object --> to handle data between class data & body request
    ```ts
    // create-post.dto.ts
    export class CreatePostDto {
      title: string;
      content: string;
    }
    ```
    ```ts
    // update-post.dto.ts
    export class UpdatePostDto {
      title?: string;
      content?: string;
    }
    ```
    For **UpdatePostDto** we make nullable for the field to permit update partial.
  - We convert data between class typescript & body request, so we need add package `class-transformer`. **Nest** will help use convert them automatically.
    ```bash
    $ yarn add class-transformer
    ```
  - Create `post.service.ts` from **PostService**
    ```ts
    import { Injectable, NotFoundException } from '@nestjs/common';
    import { CreatePostDto, UpdatePostDto } from './dto';
    import { Post } from './post.interface';
    import { v4 as uuid } from 'uuid';

    @Injectable()
    export class PostService {
      private posts: Post[] = [];

      public async getPosts(): Promise<Post[]> {
        return this.posts;
      }

      public async getPostById(id: string): Promise<Post> {
        const post = this.posts.find((p) => p.id === id);
        if (!post) {
          throw new NotFoundException(`Post with id ${id} not found`);
        }
        return post;
      }

      public async createPost(postDto: CreatePostDto): Promise<Post> {
        const post: Post = {
          ...postDto,
          id: uuid() as string,
        };
        this.posts.push(post);
        return post;
      }
       public async updatePost(id: string, postDto: UpdatePostDto): Promise<Post> {
        const post = this.posts.find((p) => p.id === id);
        if (!post) {
          throw new NotFoundException(`Post with id ${post.id} not found`);
        }
        const updated = Object.assign(post, postDto);
        const postIndex = this.posts.findIndex((p) => p.id === post.id);
        this.posts[postIndex] = updated;
        return updated;
      }

      public async deletePost(id: string): Promise<void> {
        const postIndex = this.posts.findIndex((p) => p.id === id);
        if (postIndex < 0) {
          throw new NotFoundException(`Post with id ${id} not found`);
        }
        this.posts.splice(postIndex, 1);
      }
    }

    ```

    In this post service, we will create the **CRUD** method work with a simple **posts** array.

    **Note**: If you ask what is `@Injectable()` at above of class **PostService**?. It is a class decorator for provider use **Dependency injection (or inversion of injection)**. We will use that to inject easily in controller file.

    For more details, check [Custom providers](https://docs.nestjs.com/fundamentals/custom-providers), [Injection scopes](https://docs.nestjs.com/fundamentals/injection-scopes) & [Circular dependency](https://docs.nestjs.com/fundamentals/circular-dependency) of **Nest**.



- Create `PostController`
  Ok now, we will use the methods of **PostService** in **PostController**
  ```ts
  // post.controller.ts
  import {
    Controller,
    Body,
    Get,
    Post,
    Put,
    Delete,
    Param,
  } from '@nestjs/common';
  import { CreatePostDto, UpdatePostDto } from './dto';
  import { PostService } from './post.service';

  @Controller('posts')
  export class PostController {
    constructor(private readonly postService: PostService) {}

    @Get()
    public async getPost() {
      return await this.postService.getPosts();
    }

    @Get('/:id')
    public async getPostId(@Param('id') id: string) {
      return await this.postService.getPostById(id);
    }

    @Post('/')
    public async createPost(@Body() postDto: CreatePostDto) {
      return await this.postService.createPost(postDto);
    }

    @Put('/:id')
    public async updatePost(
      @Param('id') id: string,
      @Body() postDto: UpdatePostDto,
    ) {
      return await this.postService.updatePost(id, postDto);
    }

    @Delete('/:id')
    public async deletePost(@Param('id') id: string) {
      return await this.postService.deletePost(id);
    }
  }

  ```

  Note:
  - Make sure you use `@Controller('...')` decorator for class **PostController**
  - You can also use [Nest CLI](https://docs.nestjs.com/cli/overview) for simplify this tâche.


- Create `PostModule`
  ```ts
  // post.module.ts
  @Module({
    imports: [],
    controllers: [PostController],
    providers: [PostService],
  })
  export class PostModule {}
  ```
  Check [Nest module](https://docs.nestjs.com/modules)

- Import **PostModule** in AppModule.
  ```ts
  import { PostModule } from '@modules/post/post.module';
  import { Module } from '@nestjs/common';
  import { AppController } from './app.controller';
  import { AppService } from './app.service';
  import { ConfigModule } from '@nestjs/config';

  @Module({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        envFilePath: '.env',
      }),
      PostModule,
    ],
    controllers: [AppController],
    providers: [AppService],
  })
  export class AppModule {}

  ```
- Run server `yarn start:dev` & test routes with **Postman**

  Create newt post:
  <div align="center">
    <img src="../docs/images/1-create-post.png" alt="create post">
  </div>

  Get all posts:
  <div align="center">
    <img src="../docs/images/1-get-posts.png" alt="get posts">
  </div>
  ...
