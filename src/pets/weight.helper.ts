import { Pet } from './interfaces/pet.interface';

export function getTotalWeight(pets: Pet[]) {
  return pets.reduce((total, { weight }) => total + weight, 0)
}
