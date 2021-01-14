## 2. TypeORM


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
      entities: [join(__dirname, '**', '*.entity.{ts,js}')],
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
      nullable: true
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
- Run server & test api endpoints with postman

### Documentation with Swagger/Open API

To better check  available you api endpoint, I think it's usefull to setup Swagger documentation as soon as possible.

Check [swagger.io](https://swagger.io/) & [Nest Open api](https://docs.nestjs.com/openapi/introduction) for more information.

- Installation
  ```bash
  $ yarn add -D @nestjs/swagger swagger-ui-express
  ```
- Setup swagger
  Create swagger constants: `src/common/config/swagger/swagger.contants.ts`
  ```ts
  //swagger.constants.ts
  export const SWAGGER_API_ROOT = 'api/docs';
  export const SWAGGER_API_NAME = 'Simple API';
  export const SWAGGER_API_DESCRIPTION = 'Simple API Description';
  export const SWAGGER_API_CURRENT_VERSION = '1.0';

  ```

  And `src/common/config/swagger/index.ts` for swagger config
  ```ts
  import { INestApplication } from '@nestjs/common';
  import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

  import {
    SWAGGER_API_CURRENT_VERSION,
    SWAGGER_API_DESCRIPTION,
    SWAGGER_API_NAME,
    SWAGGER_API_ROOT,
  } from './swagger.constants';

  export const setupSwagger = (app: INestApplication) => {
    const options = new DocumentBuilder()
      .setTitle(SWAGGER_API_NAME)
      .setDescription(SWAGGER_API_DESCRIPTION)
      .setVersion(SWAGGER_API_CURRENT_VERSION)
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup(SWAGGER_API_ROOT, app, document);
  };

  ```
- Update swagger config in `main.ts` file
  ```diff
  // main.ts
  async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.enableCors();
    app.useGlobalPipes(new ValidationPipe());
    // attaches cookies to request object
    app.use(cookieParser());
    // applies security hardening settings. using defaults: https://www.npmjs.com/package/helmet
    app.use(helmet());
    app.setGlobalPrefix('api');
  + setupSwagger(app);
    const port = process.env.SERVER_PORT;
    await app.listen(port, () => {
      console.log(`Server is running at http://localhost:${port}/`);
    });
  }
  bootstrap();

  ```
  
- Update swagger tag for controller
  Using `@ApiTags('route name')` class decorator in controller file:
  ```ts
  @ApiTags('Root')
  @Controller()
  export class AppController {
  ...  
  }

  @ApiTags('Post')
  @Controller('posts')
  export class PostController {
  ...  
  }
  ```
- Run server and check api docs at route: `/api/docs`:
  <div align="center">
    <img src="docs/images/2-swagger.png" alt="Swagger docs">
  </div>