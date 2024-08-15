import { useQuery } from "@tanstack/react-query";
import { reactQueryRetry } from "sharedHelpers/logging";

// Should work like React Query's useQuery with our custom reactQueryRetry
const useNonAuthenticatedQuery = (
  queryKey: Array<string>,
  queryFunction: Function,
  queryOptions: Object = {}
): Object => useQuery( {
  queryKey: [...queryKey, queryOptions.allowAnonymousJWT],
  queryFn: queryFunction,
  retry: ( failureCount, error ) => reactQueryRetry( failureCount, error, {
    queryKey
  } ),
  ...queryOptions
} );

export default useNonAuthenticatedQuery;
