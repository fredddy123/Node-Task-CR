import * as mongoose from 'mongoose';
import { Cat } from './cat.interface';
import { Dog } from './dog.interface';

interface TopPetOwner extends Document {
  _id: mongoose.Types.ObjectId,
  name: string,
  age: number,
  cats: Cat[],
  dogs: Dog[],
}

export interface TopPetOwnersItem extends mongoose.Document {
  readonly petsCount: number;
  readonly owners: TopPetOwner[]
}
