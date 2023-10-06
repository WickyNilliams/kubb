import useSWR from 'swr'
import type { SWRConfiguration, SWRResponse } from 'swr'
import client from '../../../../client'
import type { GetUserByNameQueryResponse, GetUserByNamePathParams, GetUserByName400, GetUserByName404 } from '../../../models/ts/userController/GetUserByName'

export function getUserByNameQueryOptions<TData = GetUserByNameQueryResponse, TError = GetUserByName400 | GetUserByName404>(
  username: GetUserByNamePathParams['username'],
  options: Partial<Parameters<typeof client>[0]> = {},
): SWRConfiguration<TData, TError> {
  return {
    fetcher: () => {
      return client<TData, TError>({
        method: 'get',
        url: `/user/${username}`,

        ...options,
      }).then((res) => res.data)
    },
  }
}

/**
 * @summary Get user by user name
 * @link /user/:username
 */

export function useGetUserByName<TData = GetUserByNameQueryResponse, TError = GetUserByName400 | GetUserByName404>(
  username: GetUserByNamePathParams['username'],
  options?: {
    query?: SWRConfiguration<TData, TError>
    client?: Partial<Parameters<typeof client<TData, TError>>[0]>
  },
): SWRResponse<TData, TError> {
  const { query: queryOptions, client: clientOptions = {} } = options ?? {}

  const query = useSWR<TData, TError, string>(`/user/${username}`, {
    ...getUserByNameQueryOptions<TData, TError>(username, clientOptions),
    ...queryOptions,
  })

  return query
}
