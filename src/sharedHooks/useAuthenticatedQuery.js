import { useQuery } from "@tanstack/react-query";
import { getJWT, isLoggedIn } from "components/LoginSignUp/AuthenticationService.ts";
import { useEffect, useState } from "react";
import { logWithoutRemote } from "sharedHelpers/logger";
import { reactQueryRetry } from "sharedHelpers/logging";

const localLogger = logWithoutRemote.extend( "useAuthenticatedQuery" );

const LOGGED_IN_UNKNOWN = null;

// Should work like React Query's useQuery except it calls the queryFunction
// with an object that includes the JWT
const useAuthenticatedQuery = (
  queryKey,
  queryFunction,
  queryOptions = {}
) => {
  const [userLoggedIn, setUserLoggedIn] = useState( LOGGED_IN_UNKNOWN );

  // Whether we perform this query and whether we need to re-perform it
  // depends on whether the user is signed in. The vulnerability here is that
  // this effect might not run frequently enough to change when a user signs
  // in or out
  useEffect( ( ) => {
    isLoggedIn()
      .then( result => setUserLoggedIn( result ) )
      .catch( ( ) => setUserLoggedIn( LOGGED_IN_UNKNOWN ) );
  }, [queryKey, queryOptions] );

  // The results will probably be different depending on whether the user is
  // signed in or we wouldn't be using useAuthenticatedQuery in the first
  // place, so we need to redo this request if the auth state changed
  const authQueryKey = [...queryKey, queryOptions.allowAnonymousJWT, userLoggedIn];
  if ( authQueryKey.includes( "useIconicTaxa" ) ) {
    localLogger.debug( "authQueryKey: ", authQueryKey );
  }

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
    retry: ( failureCount, error ) => reactQueryRetry( failureCount, error, {
      queryKey
    } ),
    ...queryOptions,
    // Authenticated queries should not run until we know whether or not the
    // user is signed in
    enabled: userLoggedIn !== LOGGED_IN_UNKNOWN && queryOptions.enabled
  } );
};

export default useAuthenticatedQuery;
