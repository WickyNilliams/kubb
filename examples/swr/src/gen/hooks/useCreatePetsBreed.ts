import useSWRMutation from 'swr/mutation'

import client from '@kubb/swagger-client/client'

import type { SWRMutationConfiguration } from 'swr/mutation'
import type { CreatePetsBreedRequest, CreatePetsBreedResponse, CreatePetsBreedPathParams } from '../models/CreatePetsBreed'

/**
 * @summary Create a pet breed
 * @link /pets/${breed}
 */
export function useCreatePetsBreed<TData = CreatePetsBreedResponse, TVariables = CreatePetsBreedRequest>(
  breed: CreatePetsBreedPathParams['breed'],
  options?: {
    mutation?: SWRMutationConfiguration<TData, unknown, TVariables>
  }
) {
  const { mutation: mutationOptions } = options ?? {}

  return useSWRMutation<TData, unknown, string, TVariables>(
    `/pets/$${breed}`,
    (url, { arg: data }) => {
      return client<TData, TVariables>({
        method: 'post',
        url,
        data,
      })
    },
    mutationOptions
  )
}
