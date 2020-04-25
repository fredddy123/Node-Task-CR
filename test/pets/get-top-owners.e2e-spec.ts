import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { IPetPayload, dbCreatePet, dbDeleteAllRecords, IOwnerPayload, dbCreateOwner } from './utils';

describe('GET /pets/top-owners/:age (e2e)', () => {
  describe('and when requested with age=50', () => {
    let app: INestApplication;
    let moduleFixture: TestingModule;
    const existingCats: IPetPayload[] = [];
    const existingDogs: IPetPayload[] = [];
    const existingOwners: IOwnerPayload[] = [];
    let response: request.Response;
  
    beforeAll(async () => {
      moduleFixture = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();
      app = moduleFixture.createNestApplication();
      await app.init();

      for (let i = 0; i < 3; i++) {
        existingCats.push(await dbCreatePet({ moduleFixture }, { petType: 'cat' }));
      }

      for (let i = 0; i < 3; i++) {
        existingDogs.push(await dbCreatePet({ moduleFixture }, { petType: 'dog' }));
      }

      // top 3 pet owners at age 50 will be in such positions of the array: {index=1;pets=3}, {index=3;pets=3}, {index=5;pets=4},
      existingOwners.push(
        await dbCreateOwner(
          { moduleFixture },
          {
            age: 49,
            cats: [],
            dogs: [existingDogs[0]._id, existingDogs[1]._id, existingDogs[2]._id]
          }
        ),
        await dbCreateOwner(
          { moduleFixture },
          {
            age: 50,
            cats: [existingCats[0]._id, existingCats[1]._id, existingCats[2]._id],
            dogs: []
          }
        ),
        await dbCreateOwner(
          { moduleFixture },
          {
            age: 50,
            cats: [existingCats[2]._id],
            dogs: [existingDogs[1]._id]
          }
        ),
        await dbCreateOwner(
          { moduleFixture },
          {
            age: 50,
            cats: [existingCats[0]._id],
            dogs: [existingDogs[0]._id, existingDogs[1]._id]
          }
        ),
        await dbCreateOwner(
          { moduleFixture },
          {
            age: 50,
            cats: [existingCats[2]._id],
            dogs: [existingDogs[2]._id]
          }
        ),
        await dbCreateOwner(
          { moduleFixture },
          {
            age: 50,
            cats: [existingCats[1]._id],
            dogs: [existingDogs[0]._id, existingDogs[1]._id, existingDogs[2]._id]
          }
        ),
      );

      response = await request(app.getHttpServer()).get('/pets/top-owners/50');
    });
  
    afterAll(async () => {
      await dbDeleteAllRecords({ moduleFixture });
      await app.close();
    });

    it('should respond with status code 200', () => {
      expect(response.status).toBe(200);
    });

    it('should respond with proper data', () => {
      expect(response.body).toEqual([
        {
          owners: [
            {
              _id: existingOwners[5]._id,
              age: existingOwners[5].age,
              cats: [
                existingCats.find(cat => cat._id === existingOwners[5].cats[0]),
              ],
              dogs: [
                existingDogs.find(dog => dog._id === existingOwners[5].dogs[0]),
                existingDogs.find(dog => dog._id === existingOwners[5].dogs[1]),
                existingDogs.find(dog => dog._id === existingOwners[5].dogs[2]),
              ],
              name: existingOwners[5].name
            }
          ],
          petsCount: 4
        },
        {
          owners: [
            {
              _id: existingOwners[1]._id,
              age: existingOwners[1].age,
              cats: [
                existingCats.find(cat => cat._id === existingOwners[1].cats[0]),
                existingCats.find(cat => cat._id === existingOwners[1].cats[1]),
                existingCats.find(cat => cat._id === existingOwners[1].cats[2]),
              ],
              dogs: [],
              name: existingOwners[1].name
            },
            {
              _id: existingOwners[3]._id,
              age: existingOwners[3].age,
              cats: [
                existingCats.find(cat => cat._id === existingOwners[3].cats[0]),
              ],
              dogs: [
                existingDogs.find(dog => dog._id === existingOwners[3].dogs[0]),
                existingDogs.find(dog => dog._id === existingOwners[3].dogs[1]),
              ],
              name: existingOwners[3].name
            }
          ],
          petsCount: 3
        }
      ]);
    })
  });
});
