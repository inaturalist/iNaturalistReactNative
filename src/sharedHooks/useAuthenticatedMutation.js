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
      if ( error.status === 401
        || ( error.errors && error.errors[0]?.errorCode === "401" )
        || JSON.stringify( error ).includes( "JWT is missing or invalid" ) ) {
        const errorContext = {
          routeName: route?.name,
          routeParams: route?.params,
          mutationName: mutationOptions.mutationKey || "unknown",
          timestamp: new Date().toISOString(),
          errorMessage: error.message || "JWT is missing or invalid"
        };

        logger.error( "401 JWT error in mutation:", errorContext );

        // Try to refresh the token explicitly
        // Important: We don't await this to avoid blocking the error handling
        getJWT( true ).catch( refreshError => {
          logger.error( "Failed to refresh token in mutation after 401:", refreshError );
        } );

        return handleError( error, {
          context: errorContext,
          throw: mutationOptions.throwOnError !== false
        } );
      }

      if ( error.status === 429 || ( error.response && error.response.status === 429 ) ) {
        const errorContext = {
          routeName: route?.name,
          routeParams: route?.params,
          mutationName: mutationOptions.mutationKey || "unknown",
          timestamp: new Date().toISOString()
        };

        logger.error( "429 in mutation:", errorContext );

        return handleError( error, {
          context: errorContext,
          throw: mutationOptions.throwOnError !== false
        } );
      }

      // Call original handleError for non-429 and non-401 errors
      return handleError( error );
    },
    ...mutationOptions
  } );
};

export default useAuthenticatedMutation;
