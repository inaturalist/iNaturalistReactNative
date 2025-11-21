import { QueryKey, useQuery } from "@tanstack/react-query";
import { getJWT, isLoggedIn } from "components/LoginSignUp/AuthenticationService";
import { useEffect, useState } from "react";
import { handleRetryDelay, reactQueryRetry } from "sharedHelpers/logging";

const LOGGED_IN_UNKNOWN = null;

interface QueryOptions {
  allowAnonymousJWT?: boolean;
  enabled?: boolean;
  retry?: boolean;
}

type QueryFunction<Response> = ( options: { api_token: string | null } ) => Promise<Response>;

// Should work like React Query's useQuery except it calls the queryFunction
// with an object that includes the JWT
const useAuthenticatedQuery = <Response>(
  queryKey: QueryKey,
  queryFunction: QueryFunction<Response>,
  queryOptions: QueryOptions = {}
) => {
  const [userLoggedIn, setUserLoggedIn] = useState<boolean | null>( LOGGED_IN_UNKNOWN );

  useEffect( ( ) => {
    const checkAuth = async ( ) => {
      try {
        const result = await isLoggedIn( );
        setUserLoggedIn( result );
      } catch ( error ) {
        console.warn( "Auth check failed:", error );
        setUserLoggedIn( false );
      }
    };

    checkAuth( );
  }, [] );

  // The results will probably be different depending on whether the user is
  // signed in or we wouldn't be using useAuthenticatedQuery in the first
  // place, so we need to redo this request if the auth state changed
  const authQueryKey = [...queryKey, queryOptions.allowAnonymousJWT, userLoggedIn];

  return useQuery( {
    queryKey: authQueryKey,
    queryFn: async ( ) => {
      // Note, getJWT() takes care of fetching a new token if the existing
      // one is expired. We *could* store the token in state with useState if
      // fetching from RNSInfo becomes a performance issue
      const apiToken = await getJWT( queryOptions.allowAnonymousJWT );
      const options = {
        api_token: apiToken
      };
      return queryFunction( options );
    },
    ...queryOptions,
    retry: queryOptions.retry !== false
      ? ( failureCount, error ) => reactQueryRetry( failureCount, error, {
        queryKey
      } )
      : false,
    retryDelay: ( failureCount, error ) => handleRetryDelay( failureCount, error ),
    // Authenticated queries should not run until we know whether or not the
    // user is signed in
    enabled: userLoggedIn !== LOGGED_IN_UNKNOWN && queryOptions.enabled
  } );
};

export default useAuthenticatedQuery;
