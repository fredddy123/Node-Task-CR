import * as mongoose from 'mongoose';

export interface Owner extends mongoose.Document {
  readonly name: string;
  readonly age: number;
  readonly cats: mongoose.Types.ObjectId[];
  readonly dogs: mongoose.Types.ObjectId[];
}
