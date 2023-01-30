// @flow

import { useQuery } from "@tanstack/react-query";
import { getJWT } from "components/LoginSignUp/AuthenticationService";

// Should work like React Query's useQuery except it calls the queryFunction
// with an object that includes the JWT
const useAuthenticatedQuery = (
  queryKey: Array<mixed>,
  queryFunction: Function,
  queryOptions: Object = {}
): any => useQuery( {
  queryKey,
  queryFn: async ( ) => {
    // Note, getJWT() takes care of fetching a new token if the existing
    // one is expired. We *could* store the token in state with useState if
    // fetching from RNSInfo becomes a performance issue
    const apiToken = await getJWT( );
    const options = {
      api_token: apiToken
    };
    return queryFunction( options );
  },
  ...queryOptions
} );

export default useAuthenticatedQuery;
