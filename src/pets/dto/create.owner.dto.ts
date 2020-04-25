import * as mongoose from 'mongoose';

export class CreateOwnerDto {
  readonly name: string;
  readonly age: number;
  readonly cats: mongoose.Types.ObjectId[];
  readonly dogs: mongoose.Types.ObjectId[];
}
