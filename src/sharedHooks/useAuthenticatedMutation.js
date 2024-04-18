// @flow

import { useMutation } from "@tanstack/react-query";
import handleError from "api/error";
import { getJWT } from "components/LoginSignUp/AuthenticationService";

// Should work like React Query's useMutation except it calls the queryFunction
// with an object that includes the JWT
const useAuthenticatedMutation = (
  mutationFunction: ( ) => void,
  mutationOptions: object = {}
): any => useMutation( {
  mutationFn: async params => {
    // Note, getJWTToken() takes care of fetching a new token if the existing
    // one is expired. We *could* store the token in state with useState if
    // fetching from RNSInfo becomes a performance issue
    const apiToken = await getJWT( );
    const options = {
      api_token: apiToken
    };
    return mutationFunction( params, options );
  },
  onError: handleError,
  ...mutationOptions
} );

export default useAuthenticatedMutation;
