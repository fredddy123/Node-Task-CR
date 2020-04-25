import * as mongoose from 'mongoose';

export const OwnerSchema = new mongoose.Schema({
  name: String,
  age: Number,
  cats: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cat',
    },
  ],
  dogs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dog',
    },
  ],
}, { versionKey: false });
