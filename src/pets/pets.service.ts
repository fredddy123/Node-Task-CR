import { Model } from 'mongoose';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cat } from './interfaces/cat.interface';
import { Dog } from './interfaces/dog.interface';
import { Owner } from './interfaces/owner.interface';
import { getTotalWeight } from './weight.helper';
import { CreateCatDto } from './dto/create.cat.dto';
import { CreateDogDto } from './dto/create.dog.dto';
import { CreateOwnerDto } from './dto/create.owner.dto';

@Injectable()
export class PetsService {
  constructor(
    @InjectModel('Cat') private readonly catModel: Model<Cat>,
    @InjectModel('Dog') private readonly dogModel: Model<Dog>,
    @InjectModel('Owner') private readonly ownerModel: Model<Owner>,
  ) {}

  async addCat(createCatDto: CreateCatDto): Promise<Cat> {
    const createdCat = new this.catModel(createCatDto);
    return createdCat.save();
  }

  async addDog(createDogDto: CreateDogDto): Promise<Dog> {
    const createdDog = new this.dogModel(createDogDto);
    return createdDog.save();
  }

  async addOwner(createOwnerDto: CreateOwnerDto): Promise<Owner> {
    const createdOwner = new this.dogModel(createOwnerDto);
    return createdOwner.save();
  }

  async findAll<T = Cat | Dog>(petType?: 'cat' | 'dog'): Promise<T[]> {
    switch (petType) {
      case 'cat':
        return this.catModel.find();
      case 'dog':
        return this.dogModel.find();
      default:
        return [
          ...(await this.catModel.find()),
          ...(await this.dogModel.find()),
        ];
    }
  }

  async findCatById(catId: string): Promise<Cat> {
    const cat = await this.catModel.findById(catId);
    if (!cat) {
      throw new HttpException(
        'Cat with given id can not be found',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return cat;
  }

  async findDogById(catId: string): Promise<Dog> {
    const dog = await this.dogModel.findById(catId);
    if (!dog) {
      throw new HttpException(
        'Dog with given id can not be found',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return dog;
  }

  async getCatsWeight(): Promise<number> {
    const cats = await this.catModel.find({}, { weight: 1 }).exec();
    // maybe this logic could be handled using some aggregation? don't have time to think through that
    return getTotalWeight(cats);
  }

  async getDogsWeight(): Promise<number> {
    const dogs = await this.dogModel.find({}, { weight: 1 }).exec();
    return getTotalWeight(dogs);
  }

  async getHappyDogs(): Promise<string[]> {
    return ( await this.dogModel.find({wagsTail: true}, {name: 1}) ).map(i => i.name)
    // return this.dogModel.find({wagsTail: true}).distinct('name'); // this is more clean approach, but duplicate names will be deleted
  }

  async getTopThreePetOwnersAtAge(ownerAge: number): Promise<any> {
    const owners = await this.ownerModel.aggregate([ // don't have time to closely review this query...
      {
        $group: {
          _id: {
            $sum: [{ $size: '$cats' }, { $size: '$dogs' }],
          },
          ids: { $addToSet: '$_id' },
        },
      },
      { $sort: { _id: -1 } },
      {
        $lookup: {
          from: 'owners',
          let: { ownerIds: '$ids' },
          pipeline: [
            { $match: { $expr: { $in: ['$_id', '$$ownerIds'] } } },
            {
              $lookup: {
                from: 'cats',
                let: { catIds: '$cats' },
                pipeline: [
                  {
                    $match: { $expr: { $in: ['$_id', '$$catIds'] } },
                  },
                ],
                as: 'cats',
              },
            },
            {
              $lookup: {
                from: 'dogs',
                let: { dogIds: '$dogs' },
                pipeline: [
                  {
                    $match: { $expr: { $in: ['$_id', '$$dogIds'] } },
                  },
                ],
                as: 'dogs',
              },
            },
          ],
          as: 'owners',
        },
      },
    ]);

    // this logic should be handled in some way in the aggregation but I don't have already time to think through how to do that properly
    let result = [];
    for (const owner of owners) {
      result.push({
        petsCount: owner._id,
        owners: owner.owners.filter(owner => owner.age == ownerAge),
      });
    }

    return result.slice(0, 3);
  }
}
