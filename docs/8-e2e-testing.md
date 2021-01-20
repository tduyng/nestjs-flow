## 8. End to end testing (e2e)


Check the code at branch [8-e2e-testing](https://gitlab.com/tienduy-nguyen/nestjs-flow/-/tree/8-e2e-testing)

Check more informations at [Nestjs end to end testing](https://docs.nestjs.com/fundamentals/testing)

Unlike unit testings (individual modules, methods or class test), **end to end** testing  focus on the integrity of the application. We will test the entire application from start to finish, just like a regular user would, to see if it behaves as expected.

Nest makes it easy to use the [Supertest](https://github.com/visionmedia/supertest) library to simulate HTTP requests.

When we create project with **Nest CLI**, if you remember, there is always an folder **test** was create in the root project. In this folder, we we save our file **end-to-end(e2e)** testing.

### Test root folder
In the **test** root folder (`<rootDir>/test`), we have 2 files:
- **jest-e2e.json**: Config for e2e test
  `jest-e2e.json` generated from **Nest ClI**:
  ```json
  {
    "moduleFileExtensions": ["js", "json", "ts"],
    "rootDir": ".",
    "testEnvironment": "node",
    "testRegex": ".e2e-spec.ts$",
    "transform": {
      "^.+\\.(t|j)s$": "ts-jest"
    }
  }

  ```
- **app.e2e-spec.ts**: File test for app module. We can create each files e2e test for each controller. But in our demo, we don't have many controller, to simplify, we can  put all the test code of all controllers in this **app.e2e-spec.ts** file.
  ```ts
  // test/app.e2e-spec.ts
  import { Test, TestingModule } from '@nestjs/testing';
  import { INestApplication } from '@nestjs/common';
  import * as request from 'supertest';
  import { AppModule } from '../src/app.module';

  describe('AppController (e2e)', () => {
    let app: INestApplication;

    beforeEach(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

      app = moduleFixture.createNestApplication();
      await app.init();
    });

    it('/ (GET)', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect('Hello World!');
    });
  });

  ```


- For running e2e test, Nest has already setup it in `package.json` file: `yarn test:e2e`


**Note**: For name of e2e test file, make sure you have suffix `.e2e-spec.ts`, because, if you look in `jest-e2e.json`, it matches only with this suffix (Or you can change as you want, but you need match them together)

### Develop
- Firstly, we will modify a little bit config in `jest-e2e.json` to work properly with our project:

  `jest-e2e.json` file:
  ```json
  {
    "moduleFileExtensions": ["js", "json", "ts"],
    "rootDir": "../",
    "testEnvironment": "node",
    "testRegex": ".e2e-spec.ts$",
    "transform": {
      "^.+\\.(t|j)s$": "ts-jest"
    },
    "moduleNameMapper": {
      "@common/(.*)": "<rootDir>/src/common/$1",
      "@modules/(.*)": "<rootDir>/src/modules/$1",
      "@app/(.*)": "<rootDir>/src/app/$1"
    }
  }

  ```
Now we will start make e2e test for each module.
- **AppModule**
  As **AppModule** has only an root route, and it return 'Hello world' when an user request. So the e2e test we will be like this:
  ```ts
  import { Test, TestingModule } from '@nestjs/testing';
  import { INestApplication } from '@nestjs/common';
  import request from 'supertest';
  import { AppModule } from '../src/app/app.module';

  describe('AppController (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

      app = moduleFixture.createNestApplication();
      // app.useGlobalPipes(new ValidationPipe({ skipMissingProperties: true }));
      // app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
      await app.init();
    });

    afterAll(async () => {
      await app.close();
    });

    /* Root */
    describe('AppModule', () => {
      it('(GET) /', () => {
        return request(app.getHttpServer())
          .get('/')
          .expect(200)
          .expect('Hello World!');
      });
    });

  });
  ```
  - When user request to root (/), we will need request successfully, it will return with status code = 200 and body = 'Hello World!')

  **Note**: Here is just simple setup for app initialization, but you can setup all necessary configurations for your app  as in `main.ts` file for app too.

  For example: `app.useGlobalPipes(...)`, `app.useGlobalInterceptors(...)`, `app.enableCors()`...et...

### Other modules

The end to end testing focus on user story, so it's better you make the test follow this approach. For example: When you go to website:
- You will request root route first
- After you create an account
- You check login route
- After login (setHeader with cookie), now we have been authenticated
- Check the public routes as `get posts`, `get categories`
- Test actions in private route as `createPost`, `updatePost`; `deletePost`...
- We can create also another file test for another approach with non authenticate and check authorization access route

Example for test e2e login:
```ts
  /* Auth */
  describe('AuthModule', () => {
    describe('(POST) /auth/login', () => {
      it('Should login successfully', async () => {
        const user = {
          email: 'user1@gmail.com',
          password: '1234567',
        };
        const data = await request(app.getHttpServer())
          .post('/auth/login')
          .send(user)
          .expect(201);
        expect(data.body).toBeDefined();
      });
    });
  });
```

In this part, there will have much code to do. I will come back to update them.

--> **Work in progress ...**
