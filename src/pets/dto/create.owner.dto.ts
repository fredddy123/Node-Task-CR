export class CreateOwnerDto {
  readonly name: string;
  readonly age: number;
  // ownerId property in Pet interface would be better though
  readonly cats: string[];
  readonly dogs: string[];
}
