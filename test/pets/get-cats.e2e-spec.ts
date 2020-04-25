import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { IPetPayload, dbCreatePet, dbDeleteAllRecords } from './utils';

describe('GET /pets/cats (e2e)', () => {
  describe('and when there are 10 cats records in db', () => {
    let app: INestApplication;
    let moduleFixture: TestingModule;
    const existingCats: IPetPayload[] = [];
  
    beforeAll(async () => {
      moduleFixture = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();
      app = moduleFixture.createNestApplication();
      await app.init();

      for (let i = 0; i < 10; i++) {
        existingCats.push(await dbCreatePet({ moduleFixture }, { petType: 'cat' }));
      }
    });
  
    afterAll(async () => {
      await dbDeleteAllRecords({ moduleFixture });
      await app.close();
    });

    describe('and when page size is 3 items', () => {
      describe('and when requested 1st page', () => {
        let response: request.Response;

        beforeAll(async () => {
          response = await request(app.getHttpServer()).get('/pets/cats?limit=3&page=1');
        });

        it('should respond with status code 200', () => {
          expect(response.status).toBe(200);
        });

        it('should respond with proper records list', () => {
          expect(response.body).toEqual({
            docs: existingCats.slice(0, 3).map(doc => ({
              ...doc,
              _id: expect.any(String),
            })),
            totalDocs: 10,
            limit: 3,
            totalPages: 4,
            page: 1,
            pagingCounter: 1,
            hasPrevPage: false,
            hasNextPage: true,
            prevPage: null,
            nextPage: 2
          });
        });
      });

      describe('and when requested 2nd page', () => {
        let response: request.Response;

        beforeAll(async () => {
          response = await request(app.getHttpServer()).get('/pets/cats?limit=3&page=2');
        });

        it('should respond with status code 200', () => {
          expect(response.status).toBe(200);
        });
  
        it('should respond with proper records list', () => {
          expect(response.body).toEqual({
            docs: existingCats.slice(3, 6).map(doc => ({
              ...doc,
              _id: expect.any(String),
            })),
            totalDocs: 10,
            limit: 3,
            totalPages: 4,
            page: 2,
            pagingCounter: 4,
            hasPrevPage: true,
            hasNextPage: true,
            prevPage: 1,
            nextPage: 3
          });
        });
      });

      describe('and when requested 4th page', () => {
        let response: request.Response;

        beforeAll(async () => {
          response = await request(app.getHttpServer()).get('/pets/cats?limit=3&page=4');
        });

        it('should respond with status code 200', () => {
          expect(response.status).toBe(200);
        });
  
        it('should respond with proper records list', () => {
          expect(response.body).toEqual({
            docs: [
              {
                ...existingCats[existingCats.length - 1],
                _id: expect.any(String),
              }
            ],
            totalDocs: 10,
            limit: 3,
            totalPages: 4,
            page: 4,
            pagingCounter: 10,
            hasPrevPage: true,
            hasNextPage: false,
            prevPage: 3,
            nextPage: null
          });
        });
      });
    });
  });
});
