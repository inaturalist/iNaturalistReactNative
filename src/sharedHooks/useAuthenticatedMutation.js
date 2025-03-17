// @flow

import { useMutation } from "@tanstack/react-query";
import handleError from "api/error";
import { getJWT } from "components/LoginSignUp/AuthenticationService.ts";
import { useSafeRoute } from "sharedHooks";

import { log } from "../../react-native-logs.config";

const logger = log.extend( "useAuthenticatedMutation" );

// Should work like React Query's useMutation except it calls the queryFunction
// with an object that includes the JWT
const useAuthenticatedMutation = (
  mutationFunction: Function,
  mutationOptions: Object = {}
): Object => {
  const route = useSafeRoute( );

  return useMutation( {
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
    onError: error => {
    // Capture context for 429 errors
      if ( error.status === 429 || ( error.response && error.response.status === 429 ) ) {
        const errorContext = {
          routeName: route?.name,
          routeParams: route?.params,
          mutationName: mutationOptions.mutationKey || "unknown",
          timestamp: new Date().toISOString()
        };

        logger.error( "429 in mutation:", errorContext );

        // Pass context to handleError
        return handleError( error, {
          context: errorContext,
          throw: mutationOptions.throwOnError !== false
        } );
      }

      // Call original handleError for non-429 errors
      return handleError( error );
    },
    ...mutationOptions
  } );
};

export default useAuthenticatedMutation;
