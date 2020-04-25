import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { IPetPayload, dbCreatePet, dbDeleteAllRecords } from './utils';

describe('GET /pets (e2e)', () => {
  describe('and when there are 10 cats and 10 dogs records in db', () => {
    let app: INestApplication;
    let moduleFixture: TestingModule;
    const existingCats: IPetPayload[] = [];
    const existingDogs: IPetPayload[] = [];
  
    beforeAll(async () => {
      moduleFixture = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();
      app = moduleFixture.createNestApplication();
      await app.init();

      for (let i = 0; i < 10; i++) {
        existingCats.push(await dbCreatePet({ moduleFixture }, { petType: 'cat' }));
      }

      for (let i = 0; i < 10; i++) {
        existingDogs.push(await dbCreatePet({ moduleFixture }, { petType: 'dog' }));
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
          response = await request(app.getHttpServer()).get('/pets?limit=3&page=1');
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

      describe('and when requested 4th page', () => {
        let response: request.Response;

        beforeAll(async () => {
          response = await request(app.getHttpServer()).get('/pets?limit=3&page=4');
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
              },
              {
                ...existingDogs[0],
                _id: expect.any(String),
              },
              {
                ...existingDogs[1],
                _id: expect.any(String),
              }
            ],
            totalDocs: 20,
            limit: 3,
            totalPages: 7,
            page: 4,
            pagingCounter: 10,
            hasPrevPage: true,
            hasNextPage: true,
            prevPage: 3,
            nextPage: 5
          });
        });
      });

      describe('and when requested 5th page', () => {
        let response: request.Response;

        beforeAll(async () => {
          response = await request(app.getHttpServer()).get('/pets?limit=3&page=5');
        });

        it('should respond with status code 200', () => {
          expect(response.status).toBe(200);
        });
  
        it('should respond with proper records list', () => {
          expect(response.body).toEqual({
            docs: [
              {
                ...existingDogs[2],
                _id: expect.any(String),
              },
              {
                ...existingDogs[3],
                _id: expect.any(String),
              },
              {
                ...existingDogs[4],
                _id: expect.any(String),
              }
            ],
            totalDocs: 20,
            limit: 3,
            totalPages: 7,
            page: 5,
            pagingCounter: 13,
            hasPrevPage: true,
            hasNextPage: true,
            prevPage: 4,
            nextPage: 6
          });
        });
      });

      describe('and when requested 6th page', () => {
        let response: request.Response;

        beforeAll(async () => {
          response = await request(app.getHttpServer()).get('/pets?limit=3&page=6');
        });

        it('should respond with status code 200', () => {
          expect(response.status).toBe(200);
        });
  
        it('should respond with proper records list', () => {
          expect(response.body).toEqual({
            docs: [
              {
                ...existingDogs[5],
                _id: expect.any(String),
              },
              {
                ...existingDogs[6],
                _id: expect.any(String),
              },
              {
                ...existingDogs[7],
                _id: expect.any(String),
              }
            ],
            totalDocs: 20,
            limit: 3,
            totalPages: 7,
            page: 6,
            pagingCounter: 16,
            hasPrevPage: true,
            hasNextPage: true,
            prevPage: 5,
            nextPage: 7
          });
        });
      });

      describe('and when requested 7th page', () => {
        let response: request.Response;

        beforeAll(async () => {
          response = await request(app.getHttpServer()).get('/pets?limit=3&page=7');
        });

        it('should respond with status code 200', () => {
          expect(response.status).toBe(200);
        });
  
        it('should respond with proper records list', () => {
          expect(response.body).toEqual({
            docs: [
              {
                ...existingDogs[8],
                _id: expect.any(String),
              },
              {
                ...existingDogs[9],
                _id: expect.any(String),
              }
            ],
            totalDocs: 20,
            limit: 3,
            totalPages: 7,
            page: 7,
            pagingCounter: 19,
            hasPrevPage: true,
            hasNextPage: false,
            prevPage: 6,
            nextPage: null
          });
        });
      });
    });
  });
});
