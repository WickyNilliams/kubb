import { faker } from "@faker-js/faker";

import { PetNotFound } from "../models/PetNotFound";


export function createPetNotFound(): NonNullable<PetNotFound> {
  return {"code": faker.number.float({}),"message": faker.string.alpha()};
}
  