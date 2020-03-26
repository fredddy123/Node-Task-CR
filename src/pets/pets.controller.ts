import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { PetsService } from './pets.service';
import { Cat } from './interfaces/cat.interface';
import { Dog } from './interfaces/dog.interface';
import { CreateCatDto } from './dto/create.cat.dto';
import { CreateDogDto } from './dto/create.dog.dto';
import { CreateOwnerDto } from './dto/create.owner.dto';

@Controller('pets')
export class PetsController {
  constructor(private readonly petsService: PetsService) {}

  @Post('/cats')
  async addCat(@Body() createCatDto: CreateCatDto) {
    await this.petsService.addCat(createCatDto);
  }

  @Post('/dogs')
  async addDog(@Body() createDogDto: CreateDogDto) {
    await this.petsService.addDog(createDogDto);
  }

  @Post('/owners')
  async addOwner(@Body() createOwnerDto: CreateOwnerDto) {
    await this.petsService.addOwner(createOwnerDto);
  }

  @Get()
  findAll(): Promise<Array<Cat | Dog>> {
    return this.petsService.findAll();
  }

  @Get('/cats')
  findCats(): Promise<Cat[]> {
    return this.petsService.findAll<Cat>('cat');
  }

  @Get('/dogs')
  findDogs(): Promise<Dog[]> {
    return this.petsService.findAll<Dog>('dog');
  }

  @Get('/cats/:id')
  findCat(@Param('id') id: string): Promise<Cat> {
    return this.petsService.findCatById(id);
  }

  @Get('/dogs/:id')
  findDog(@Param('id') id: string): Promise<Dog> {
    return this.petsService.findDogById(id);
  }

  @Get('/cats-weight')
  getCatsWeight(): Promise<number> {
    return this.petsService.getCatsWeight();
  }

  @Get('/dogs-weight')
  getDogsWeight(): Promise<number> {
    return this.petsService.getDogsWeight();
  }

  @Get('/happy-dogs')
  getHappyDogs(): Promise<string[]> {
    return this.petsService.getHappyDogs();
  }

  @Get('/top-owners/:age')
  getPetOwners(@Param('id') age: number): Promise<string[]> {
    return this.petsService.getTopThreePetOwnersAtAge(age);
  }
}
