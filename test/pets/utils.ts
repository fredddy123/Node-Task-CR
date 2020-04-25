import * as faker from 'faker';
import * as mongoose from 'mongoose';
import { Cat } from '../../src/pets/interfaces/cat.interface';
import { Dog } from '../../src/pets/interfaces/dog.interface';
import { Owner } from '../../src/pets/interfaces/owner.interface';

export interface IPetPayload {
  _id?: mongoose.Types.ObjectId;
  name: string;
  age: number;
  breed: string;
  weight: number;
  hasClippedClaws?: boolean;
  wagsTail?: boolean;
}

type PetType = 'cat' | 'dog';

function getPetModel({moduleFixture}, petType: PetType) {
  return {
    cat: moduleFixture.get('CatModel') as mongoose.PaginateModel<Cat>,
    dog: moduleFixture.get('DogModel') as mongoose.PaginateModel<Dog>
  }[petType];
}

export async function dbCreatePet({ moduleFixture }, { petType }: { petType: PetType }) {
  const petModel = getPetModel({ moduleFixture }, petType);

  const petData: IPetPayload = {
    name: faker.lorem.word(),
    age: faker.random.number(),
    breed: faker.lorem.word(),
    weight: faker.random.number(),
    [{
      cat: 'hasClippedClaws',
      dog: 'wagsTail',
    }[petType]]: faker.random.boolean(),
  };

  const { _id } = await petModel.create(petData);

  return {
    ...petData,
    _id: _id.toString(),
  };
}

export async function dbDeleteAllRecords({ moduleFixture }) {
  const catModel = getPetModel({ moduleFixture }, 'cat') as mongoose.PaginateModel<Cat>;
  const dogModel = getPetModel({ moduleFixture }, 'dog') as mongoose.PaginateModel<Dog>;
  const ownerModel = moduleFixture.get('OwnerModel') as mongoose.Model<Owner>;

  await catModel.deleteMany({});
  await dogModel.deleteMany({});
  await ownerModel.deleteMany({});
}

export interface IOwnerPayload {
  _id?: string;
  name: string;
  age: number;
  cats: mongoose.Types.ObjectId[];
  dogs: mongoose.Types.ObjectId[];
}

export async function dbCreateOwner(
  { moduleFixture }, { cats, dogs, age }: { age: number, cats: mongoose.Types.ObjectId[], dogs: mongoose.Types.ObjectId[] }
) {
  const ownerModel = moduleFixture.get('OwnerModel') as mongoose.Model<Owner>;

  const ownerData: IOwnerPayload = {
    name: faker.lorem.word(),
    age,
    cats,
    dogs,
  };

  const { _id } = await ownerModel.create(ownerData);

  return {
    ...ownerData,
    _id: _id.toString(),
  };
}