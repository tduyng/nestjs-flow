# NESTJS FLOW

End to end build a project with NestJS

<details>
<summary>All branches of projects</summary>
1. Init project: Controller, services, modules
2. Database, typeorm
3. Auth with passpord, jwt
4. Error handling & data validation
5. Serializing response with interceptors
6. Understand dependency injection in Nestjs
7. Database relationship
8. Unit tests
9. Testing service, controllers with integration tests
10. Update file to Amazon s3
11. Managing private files with amazon S3
12. Elastic search
13. Implement refresh token jwt
14. Imporving performance of database with indexes
15. Defining transactions with typeorm
16. Using the array data type of database with typeorm
17. Offset and keyset pagination with database & typeorm
18. Exploring idea of microservices
19. Using RabbitMQ to communicate with microservices
20. Communicating with microservices using gRPC framework
21. Pattern **Command-Querry-Responsibility-Segregation** (CQRS)
22. Storing JSON with PostgresSQL & TypeORM
23. Implementing in-memory cache to increase the performance
24. Cache with Redis. Running the app in a Nodejs cluster
</details>

---

<details>

<summary>Table of content</summary>

- [NESTJS FLOW](#nestjs-flow)
  - [1. Init project](#1-init-project)
    - [Installation](#installation)
    - [Bootstrap projects](#bootstrap-projects)
    - [Using variable environment (.env)](#using-variable-environment-env)
    - [Modules](#modules)
      - [Post modules](#post-modules)
  - [2-TypeORM](#2-typeorm)
    - [Post modules](#post-modules-1)



</details>


---

When we work with Nodejs in big projects, the project structure become so important. 
So if you love typescript, [NestJS](https://nestjs.com/) will help you resolve this problem.

So what is NestJS?

Nest (NestJS) is a progressive Nodejs framework (open-source) for building efficient, scalable, testable. It is built with and fully supports TypeScript  and combines elements of OOP (Object Oriented Programming), FP (Functional Programming), and FRP (Functional Reactive Programming). It use many strong design pattern: Dependency injection, MVC, micro services, CQRS pattern ...


Check [Nest](https://nestjs.com/) for more information.

Now we will code a REST api project with NestJS from basics to advances.

Each big step will separate by each branch git.

## 1. Init project

Check the code at branch [1-init-project](https://gitlab.com/tienduy-nguyen/nestjs-flow/-/tree/1-init-project)

<details>
<summary>Click to expand section</summary>


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
    <img src="docs/images/1-create-post.png" alt="create post">
  </div>

  Get all posts:
  <div align="center">
    <img src="docs/images/1-get-posts.png" alt="get posts">
  </div>
  ...
  
</details>

## 2-TypeORM

<details>
<summary>Click here to expand section</summary>

Check the code at branch [2-typeorm](https://gitlab.com/tienduy-nguyen/nestjs-flow/-/tree/2-typeorm)

---

In the first part, we are used an array to fake database. In this part, we will use the real database PostgreQL with TypeORM.

[TypeORM](https://github.com/typeorm/typeorm) is an object relation mapping (open source) for Database SQL (SQlite, PostgreSQL, MySQL, MSSQL and also for mongodb). It make the work more easier with SQL query.

You can consider use [Prisma](https://github.com/prisma/prisma) - the next generation of TypeORM. It is a awesome tool, solve many trouble of TypeORM. But there are some interesting features is under preview version.


- Install dependencies
  ```bash
  $ yarn add @nest/typeorm typeorm pg
  ```
- Config ORM
  Update variables in `.env` file
  ```env
  SERVER_PORT=1776
  ROUTE_GLOBAL_PREFIX=/api
  JWT_SECRET=justanotherworld

  # Typeorm
  TYPEORM_CONNECTION = postgres
  TYPEORM_HOST = postgres
  TYPEORM_USERNAME = postgres
  TYPEORM_PASSWORD = postgres
  TYPEORM_DATABASE = test_db
  TYPEORM_PORT = 5432
  TYPEORM_ENTITIES = [src/modules/**/*.entity.ts]

  # For run migration cli
  TYPEORM_MIGRATIONS=[src/common/migrations/**/*.ts]
  TYPEORM_MIGRATIONS_DIR=src/common/migrations

  ```


  Create `src/common/config/ormConfig.ts`
  ```ts
  // ormConfig.ts
  export function ormConfig(): any {
  return {
      type: process.env.TYPEORM_CONNECTION,
      host: process.env.TYPEORM_HOST,
      port: Number(process.env.TYPEORM_PORT),
      username: process.env.TYPEORM_USERNAME,
      password: process.env.TYPEORM_PASSWORD,
      database: process.env.TYPEORM_DATABASE,
      autoLoadEntities: true,
      entities: ['src/modules/**/*.entity.ts'],
      logging: false,
      synchronize: true,
    };
  }
  ```
  As we setup ConfigModule with `@Nestjs/Config`, so now we can use directly `process.env` to access directly variable environment;

  **Note**: Check [Nest database](https://docs.nestjs.com/techniques/database) or [Typeorm](https://github.com/typeorm/typeorm) to understand how to config that.

  - **type**: sql driver as: postgres, mysql, mssql, mongodb ...
  - **host**: host of your database (localhost eg.)
  - **username** & **password**: permission user to controler database
  - **database**: name of database that you use for this project
  - **logging**: logging when query database  in the terminal (recommend: false)
  - **synchronize**: true. It means all the  modification in entities will synchronize automatically with your database. Attention for this feature: It will be very dangerous. You can be lost your data, should use only for develop phrase.
  - **entities**: an arry to indicate where stock entity files
  
  If you don't want `synchronize` automatically, you need consider use cli to make the migrations.

- Import `ormConfig` in `app.module`
  
  ```ts
  //app.module.ts
  import { PostModule } from '@modules/post/post.module';
  import { Module } from '@nestjs/common';
  import { AppController } from './app.controller';
  import { AppService } from './app.service';
  import { ConfigModule } from '@nestjs/config';
  import { TypeOrmModule } from '@nestjs/typeorm';
  import { ormConfig } from '@common/config/ormConfig';

  @Module({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        envFilePath: '.env',
      }),
      TypeOrmModule.forRoot(ormConfig()),
      PostModule,
    ],
    controllers: [AppController],
    providers: [AppService],
  })
  export class AppModule {}

  ```
### Post modules
- Create Post entity: `src/modules/post/post.entity.ts`
  Before create a post, we need add `moment-timezone` to handle date with timezone for column date.

  ```ts
  // post.entity.ts
  import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
  import moment from 'moment-timezone';
  @Entity()
  export class Post extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column()
    content: string;

    @Column({
      type: Date,
      default: moment(new Date()).format('YYYY-MM-DD HH:ss'),
    })
    createdAt;

    @Column({
      type: Date,
      default: moment(new Date()).format('YYYY-MM-DD HH:ss'),
    })
    updatedAt;
  }
  ```
  In the previous part, we use **uuid** package to create fake uuid. But typeorm already provide a decorator method: `@PrimaryGeneratedColumn(uuid)`. If you only want to create id: number, you just use: `@PrimaryGeneratedColumn(id)`

  Decorator method `@Column` is equivalent a column of table.


  Check [Database](https://docs.nestjs.com/techniques/database) for more details.

- Using PostEntity & PostRepository in PostService
  

  Now we will modify the old code of first part, and update theme with typeorm solution.

  As we know, Nest use strongly dependency injection pattern, it provide also for inject Repository too --> (`@InjectRepository(Entity)`)

  ```ts
  // post.service.ts
  import { Injectable, NotFoundException } from '@nestjs/common';
  import { CreatePostDto, UpdatePostDto } from './dto';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository } from 'typeorm';
  import { Post } from './post.entity';

  @Injectable()
  export class PostService {
    constructor(
      @InjectRepository(Post)
      private readonly postRepository: Repository<Post>,
    ) {}

    public async getPosts(): Promise<Post[]> {
      return this.postRepository.find();
    }

    public async getPostById(id: string): Promise<Post> {
      const post = this.postRepository.findOne({ where: { id: id } });
      if (!post) {
        throw new NotFoundException(`Post with id ${id} not found`);
      }
      return post;
    }

    public async createPost(postDto: CreatePostDto): Promise<Post> {
      const post = this.postRepository.create(postDto);
      await this.postRepository.save(post);
      return post;
    }
    public async updatePost(id: string, postDto: UpdatePostDto): Promise<Post> {
      const post = await this.postRepository.findOne({ where: { id: id } });
      if (!post) {
        throw new NotFoundException(`Post with id ${post.id} not found`);
      }
      const updated = Object.assign(post, postDto);
      updated.updatedAt = Date.now();
      await this.postRepository.save(updated);
      return updated;
    }

    public async deletePost(id: string): Promise<void> {
      await this.postRepository.delete(id);
    }
  }

  ```

  PostController will be not changed.


</details>
