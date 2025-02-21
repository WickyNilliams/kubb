import { faker } from "@faker-js/faker";

import { createUser } from "../createUser";
import { CreateUsersWithListInputError } from "../../models/ts/userController/CreateUsersWithListInput";
import { CreateUsersWithListInputMutationRequest } from "../../models/ts/userController/CreateUsersWithListInput";
import { CreateUsersWithListInputMutationResponse } from "../../models/ts/userController/CreateUsersWithListInput";

/**
 * @description successful operation
 */

export function createCreateUsersWithListInputError(): NonNullable<CreateUsersWithListInputError> {
  return undefined;
}
  

export function createCreateUsersWithListInputMutationRequest(): NonNullable<CreateUsersWithListInputMutationRequest> {
  return faker.helpers.arrayElements([createUser()]) as any;
}
  
/**
 * @description Successful operation
 */

export function createCreateUsersWithListInputMutationResponse(): NonNullable<CreateUsersWithListInputMutationResponse> {
  return createUser();
}
  