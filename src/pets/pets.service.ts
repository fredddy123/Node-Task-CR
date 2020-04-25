import { Model, PaginateModel } from 'mongoose';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cat } from './interfaces/cat.interface';
import { Dog } from './interfaces/dog.interface';
import { Owner } from './interfaces/owner.interface';
import { CreateCatDto } from './dto/create.cat.dto';
import { CreateDogDto } from './dto/create.dog.dto';
import { CreateOwnerDto } from './dto/create.owner.dto';
import { TopPetOwnersItem } from './interfaces/top_pet_owners_item.interface';
import { HappyDog } from './interfaces/happy_dog.interface';
import { ListPetsResponse } from './dto/list.pets.response';

function formatFindAllResponse(data) {
  return {
    docs: data.docs.map(doc => ({
      _id: doc._id,
      name: doc.name,
      age: doc.age,
      breed: doc.breed,
      weight: doc.weight,
      ...('hasClippedClaws' in doc ? { hasClippedClaws: doc.hasClippedClaws } : {}),
      ...('wagsTail' in doc ? { wagsTail: doc.wagsTail } : {}),
    })),
    totalDocs: data.totalDocs,
    limit: data.limit,
    totalPages: data.totalPages,
    page: data.page,
    pagingCounter: data.pagingCounter,
    hasPrevPage: data.hasPrevPage,
    hasNextPage: data.hasNextPage,
    prevPage: data.prevPage,
    nextPage: data.nextPage,
  };
}

async function fetchPetsTotalWeight(dbService) {
  const [{ totalWeight }] = await dbService.aggregate([
    {
      $group: {
        _id: null,
        totalWeight: {
          $sum: "$weight"
        }
      }
    }
  ]);

  return totalWeight;
}

interface PaginationInterface {
  limit: number;
  page: number;
}

interface FindAllArgsInterface {
  petType?: 'cat' | 'dog';
  pagination?: PaginationInterface;
}

@Injectable()
export class PetsService {
  constructor(
    @InjectModel('Cat') private readonly catModel: PaginateModel<Cat>,
    @InjectModel('Dog') private readonly dogModel: PaginateModel<Dog>,
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
    const createdOwner = new this.ownerModel(createOwnerDto);
    return createdOwner.save();
  }

  async findAll({ petType, pagination: { limit, page } }: FindAllArgsInterface): Promise<ListPetsResponse> {
    switch (petType) {
      case 'cat':
        return formatFindAllResponse(await this.catModel.paginate({}, { limit, page }));
      case 'dog':
          return formatFindAllResponse(await this.dogModel.paginate({}, { limit, page }));
      default: {
        const cats = await this.catModel.paginate({}, { limit, page });
        if (cats.docs.length === limit) {
          return formatFindAllResponse(cats);
        }

        const dogsLimit = limit - cats.docs.length;

        const globalOffset = (page - 1) * limit;
        const dogsOffset = globalOffset - cats.totalDocs < 0 ? 0 : globalOffset - cats.totalDocs;

        const dogs = await this.dogModel.paginate({}, { limit: dogsLimit, offset: dogsOffset });

        const totalPages = Math.ceil((cats.totalDocs + dogs.totalDocs) / 3);
        const hasPrevPage = page - 1 > 0;
        const hasNextPage = page + 1 <= totalPages;

        return formatFindAllResponse({
          docs: [...cats.docs, ...dogs.docs].map(doc => ({
            _id: doc._id,
            name: doc.name,
            age: doc.age,
            breed: doc.breed,
            weight: doc.weight,
            ...('hasClippedClaws' in doc ? { hasClippedClaws: doc.hasClippedClaws } : {}),
            ...('wagsTail' in doc ? { wagsTail: doc.wagsTail } : {}),
          })),
          totalDocs: cats.totalDocs + dogs.totalDocs,
          limit: limit,
          totalPages: totalPages,
          page: page,
          pagingCounter: (page - 1) * limit + 1,
          hasPrevPage: hasPrevPage,
          hasNextPage: hasNextPage,
          prevPage: hasPrevPage ? page - 1 : null,
          nextPage: hasNextPage ? page + 1 : null,
        });
      }
    }
  }

  async findCatById(catId: string): Promise<Cat> {
    const cat = await this.catModel.findById(catId);
    if (!cat) {
      throw new HttpException(
        'Cat with given id can not be found',
        HttpStatus.NOT_FOUND,
      );
    }

    return cat;
  }

  async findDogById(catId: string): Promise<Dog> {
    const dog = await this.dogModel.findById(catId);
    if (!dog) {
      throw new HttpException(
        'Dog with given id can not be found',
        HttpStatus.NOT_FOUND,
      );
    }

    return dog;
  }

  async getCatsWeight(): Promise<number> {
    return fetchPetsTotalWeight(this.catModel);
  }

  async getDogsWeight(): Promise<number> {
    return fetchPetsTotalWeight(this.dogModel);
  }

  async getHappyDogs(): Promise<HappyDog[]> {
    // since dog.name is not unique field, I've made such query
    // which will produce array of such objects { _id: {unique value}, name: {not unique value} }
    return this.dogModel.aggregate([
      { $match: { wagsTail: true } },
      { $project: { "name": 1 } }
    ]);
  }

  async getTopThreePetOwnersAtAge(ownerAge: number): Promise<TopPetOwnersItem[]> {
    return this.ownerModel.aggregate([
      { $match: { age: ownerAge } },
      {
        $project: {
          totalPetsOfOwner: { $sum: [ { $size: '$cats' }, { $size: '$dogs' } ] },
          cats: "$cats",
          dogs: "$dogs"
       }
      },
      { $sort: { totalPetsOfOwner: -1 } },
      { $limit: 3 },
      {
        $group: {
          _id: {
            $sum: [ { $size: '$cats' }, { $size: '$dogs' } ]
          },
          owners_ids: { $addToSet: '$_id' }
        }
      },
      {
        $lookup: {
          from: 'owners',
          let: { ownerIds: '$owners_ids' },
          pipeline: [
            {
              $match: { $expr: { $in: [ '$_id', '$$ownerIds' ] } }
            },
            {
              $lookup: {
                from: 'cats',
                localField: 'cats',
                foreignField: '_id',
                as: 'cats'
              }
            },
            {
              $lookup: {
                from: 'dogs',
                localField: 'dogs',
                foreignField: '_id',
                as: 'dogs'
              }
            }
          ],
          as: 'owners'
        }
      },
      {
        $addFields: { petsCount: '$_id' }
      },
      { $sort: { petsCount: -1 } },
      {
        $project: { _id: 0, owners_ids: 0 }
      }
    ]);
  }
}
