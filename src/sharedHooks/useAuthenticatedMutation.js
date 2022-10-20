// @flow

import { useMutation } from "@tanstack/react-query";
import { getJWTToken } from "components/LoginSignUp/AuthenticationService";

// Should work like React Query's useMutation except it calls the queryFunction
// with an object that includes the JWT
const useAuthenticatedMutation = (
  queryFunction: Function,
  handleCallback: Function,
  queryOptions: Object = {}
): any => useMutation( async ( ) => {
  // Note, getJWTToken() takes care of fetching a new token if the existing
  // one is expired. We *could* store the token in state with useState if
  // fetching from RNSInfo becomes a performance issue
  const apiToken = await getJWTToken( );
  const options = {
    ...queryOptions,
    api_token: apiToken
  };
  return queryFunction( options );
}, handleCallback );

export default useAuthenticatedMutation;
