interface IPetResponseDoc {
  _id: string;
  name: string;
  age: number;
  breed: string;
  weight: number;
  hasClippedClaws?: boolean;
  wagsTail?: boolean;
}

export interface ListPetsResponse {
  docs: IPetResponseDoc[];
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}