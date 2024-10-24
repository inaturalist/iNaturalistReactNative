import { useInfiniteQuery } from "@tanstack/react-query";
import { getJWT } from "components/LoginSignUp/AuthenticationService.ts";
import { log } from "sharedHelpers/logger";
import { reactQueryRetry } from "sharedHelpers/logging";
import { isDebugMode } from "sharedHooks/useDebugMode";

const logger = log.extend( "useAuthenticatedInfiniteQuery" );

// Should work like React Query's useInfiniteQuery with our custom reactQueryRetry
// and authentication
const useAuthenticatedInfiniteQuery = (
  queryKey: Array<string>,
  queryFunction: Function,
  queryOptions: Object = {}
): Object => useInfiniteQuery( {
  queryKey: [...queryKey, queryOptions.allowAnonymousJWT],
  queryFn: async params => {
    // logger.info( queryKey, "queryKey in useAuthenticatedInfiniteQuery" );
    // Note, getJWT() takes care of fetching a new token if the existing
    // one is expired. We *could* store the token in state with useState if
    // fetching from RNSInfo becomes a performance issue
    if ( isDebugMode( ) ) {
      logger.info( "calling getJWT" );
    }
    const apiToken = await getJWT( queryOptions.allowAnonymousJWT );
    const options = {
      api_token: apiToken
    };
    return queryFunction( params, options );
  },
  retry: ( failureCount, error ) => reactQueryRetry( failureCount, error, {
    queryKey
  } ),
  initialPageParam: 0,
  ...queryOptions
} );

export default useAuthenticatedInfiniteQuery;
