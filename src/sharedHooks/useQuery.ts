import type { QueryFunction } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { handleRetryDelay, reactQueryRetry } from "sharedHelpers/logging";

// Should work like React Query's useQuery with our custom reactQueryRetry
const useNonAuthenticatedQuery = (
  queryKey: string[],
  queryFunction: QueryFunction,
  queryOptions: object = {},
) => useQuery( {
  queryKey: [...queryKey, queryOptions.allowAnonymousJWT],
  queryFn: queryFunction,
  retry: ( failureCount, error ) => reactQueryRetry( failureCount, error, {
    queryKey,
  } ),
  retryDelay: ( failureCount, error ) => handleRetryDelay( failureCount, error ),
  ...queryOptions,
} );

export default useNonAuthenticatedQuery;
