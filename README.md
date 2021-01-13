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



</details>


---

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
    parserOptions: {
      project: 'tsconfig.json',
  +  tsconfigRootDir: __dirname,
      sourceType: 'module',
    },
  ```

- Start server
  Run `yarn start:dev` to start server. Check all scripts availables in `package.json` file.
- Custom port