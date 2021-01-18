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

  /* Category */
  describe('CategoryModule', () => {
    it('(GET) /categories', async () => {
      const data = await request(app.getHttpServer()).get('/posts').expect(200);
      expect(data.body).toBeInstanceOf(Array);
    });

    it('(POST) /categories', async () => {
      const newCategory = {
        name: 'test',
      };
      return await request(app.getHttpServer())
        .post('/categories')
        .send(newCategory)
        .expect(401);

      // expect(data.body).toEqual({
      //   ...newCategory,
      //   id: expect.any(String),
      //   slug: expect.any(String),
      // });
    });
  });
});
