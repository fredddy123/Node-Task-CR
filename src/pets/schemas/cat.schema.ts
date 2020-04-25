import * as mongoose from 'mongoose';
const mongoosePaginate = require('mongoose-paginate-v2')

export const CatSchema = new mongoose.Schema({
  name: String,
  age: Number,
  breed: String,
  weight: Number,
  hasClippedClaws: Boolean,
}, { versionKey: false });

CatSchema.plugin(mongoosePaginate);
