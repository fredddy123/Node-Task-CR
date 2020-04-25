import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { PetsModule } from './pets/pets.module';

// normally should be handled by config
const mongoUri = {
  test: 'mongodb://localhost:27017/task-test',
  dev: 'mongodb://localhost:27017/task',
  default: 'mongodb://mongo/task'
}[process.env.NODE_ENV || 'default'];

@Module({
  imports: [
    MongooseModule.forRoot(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }),
    PetsModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
