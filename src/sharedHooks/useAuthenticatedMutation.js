// @flow

import { useMutation } from "@tanstack/react-query";
import handleError from "api/error";
import { getJWT } from "components/LoginSignUp/AuthenticationService.ts";
import { log } from "sharedHelpers/logger";
import { isDebugMode } from "sharedHooks/useDebugMode";

const logger = log.extend( "useAuthenticatedMutation" );

// Should work like React Query's useMutation except it calls the queryFunction
// with an object that includes the JWT
const useAuthenticatedMutation = (
  mutationFunction: Function,
  mutationOptions: Object = {}
): Object => useMutation( {
  mutationFn: async params => {
    // Note, getJWTToken() takes care of fetching a new token if the existing
    // one is expired. We *could* store the token in state with useState if
    // fetching from RNSInfo becomes a performance issue
    console.log( "[DEBUG useAuthenticatedMutation.js] calling getJWT" );
    if ( isDebugMode( ) ) {
      logger.info( "calling getJWT" );
    }
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
