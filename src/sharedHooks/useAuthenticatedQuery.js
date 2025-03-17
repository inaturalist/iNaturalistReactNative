import { useQuery } from "@tanstack/react-query";
import { getJWT, isLoggedIn } from "components/LoginSignUp/AuthenticationService.ts";
import { useEffect, useState } from "react";
import { reactQueryRetry } from "sharedHelpers/logging";
import { useSafeRoute } from "sharedHooks";

const LOGGED_IN_UNKNOWN = null;

// Should work like React Query's useQuery except it calls the queryFunction
// with an object that includes the JWT
const useAuthenticatedQuery = (
  queryKey,
  queryFunction,
  queryOptions = {}
) => {
  const [userLoggedIn, setUserLoggedIn] = useState( LOGGED_IN_UNKNOWN );
  const route = useSafeRoute( );

  // Whether we perform this query and whether we need to re-perform it
  // depends on whether the user is signed in. The possible vulnerability
  // here is that this effect might not run frequently enough to change when
  // a user signs in or out. The reason we're not using useCurrentUser is it
  // doesn't tell us whether we know the user's auth state yet, it only
  // returns null when we don't know OR the user is signed out.
  useEffect( ( ) => {
    isLoggedIn()
      .then( result => setUserLoggedIn( result ) )
      .catch( ( ) => setUserLoggedIn( LOGGED_IN_UNKNOWN ) );
  }, [queryKey, queryOptions] );

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
    retry: ( failureCount, error ) => reactQueryRetry( failureCount, error, {
      queryKey,
      routeName: route?.name,
      routeParams: route?.params
    } ),
    ...queryOptions,
    // Authenticated queries should not run until we know whether or not the
    // user is signed in
    enabled: userLoggedIn !== LOGGED_IN_UNKNOWN && queryOptions.enabled
  } );
};

export default useAuthenticatedQuery;
