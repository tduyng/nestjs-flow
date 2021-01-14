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
#### Bootstrap projects
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
#### Using variable environment (.env)

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