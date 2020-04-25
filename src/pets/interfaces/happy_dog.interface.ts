import * as mongoose from 'mongoose';

export interface HappyDog {
  readonly _id: mongoose.Types.ObjectId;
  readonly name: string;
}