import * as mongoose from 'mongoose';
const mongoosePaginate = require('mongoose-paginate-v2')

export const DogSchema = new mongoose.Schema({
  name: String,
  age: Number,
  breed: String,
  weight: Number,
  wagsTail: Boolean,
}, { versionKey: false });

DogSchema.plugin(mongoosePaginate);
