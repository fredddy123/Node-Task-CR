import { Controller, Get, Post, Body, Param, ParseIntPipe, Query } from '@nestjs/common';
import { PetsService } from './pets.service';
import { Cat } from './interfaces/cat.interface';
import { Dog } from './interfaces/dog.interface';
import { CreateCatDto } from './dto/create.cat.dto';
import { CreateDogDto } from './dto/create.dog.dto';
import { CreateOwnerDto } from './dto/create.owner.dto';
import { TopPetOwnersItem } from './interfaces/top_pet_owners_item.interface';
import { HappyDog } from './interfaces/happy_dog.interface';
import { ListPetsResponse } from './dto/list.pets.response';

interface FindPetsQuery {
  limit: number;
  page: number;
}

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
  findAll(@Query() query: FindPetsQuery): Promise<ListPetsResponse> {
    return this.petsService.findAll({
      pagination: {
        limit: +query.limit,
        page: +query.page,
      }
    });
  }

  @Get('/cats')
  findCats(@Query() query: FindPetsQuery): Promise<ListPetsResponse> {
    return this.petsService.findAll({
      petType: 'cat',
      pagination: {
        limit: +query.limit,
        page: +query.page,
      }
    });
  }

  @Get('/dogs')
  findDogs(@Query() query: FindPetsQuery): Promise<ListPetsResponse> {
    return this.petsService.findAll({
      petType: 'dog',
      pagination: {
        limit: +query.limit,
        page: +query.page,
      }
    });
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
  getHappyDogs(): Promise<HappyDog[]> {
    return this.petsService.getHappyDogs();
  }

  @Get('/top-owners/:age')
  getPetOwners(@Param('age', new ParseIntPipe()) age: number): Promise<TopPetOwnersItem[]> {
    return this.petsService.getTopThreePetOwnersAtAge(age);
  }
}
