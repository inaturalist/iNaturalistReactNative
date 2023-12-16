import handleError from "api/error";
import { getJWT } from "components/LoginSignUp/AuthenticationService";

import { log } from "../../react-native-logs.config";

const defaultLogger = log.extend( "logging.js" );

// returns string representation of an object, intended for debugging
function inspect( target ) {
  return JSON.stringify( target );
}

async function reactQueryRetry( failureCount, error, options = {} ) {
  const logger = options.logger || defaultLogger;
  if ( typeof ( options.beforeRertry ) === "function" ) {
    options.beforeRertry( failureCount, error );
  } else {
    logger.warn( error.status, "error for query, error: ", error, ", options: ", options );
  }
  if ( error.status > 500 ) {
    logger.info( "Handing 500+ error, failureCount: ", failureCount );
    handleError( error );
    return false;
  }
  if (
    // If this is an actual 408 Request Timeout error, we probably want to
    // retry... but this will probably never happen
    error.status === 408
    // If there's just no network at the moment, definitely retry
    || ( error instanceof TypeError && error.message.match( "Network request failed" ) )
  ) {
    const retryValue = failureCount < 3;
    logger.info(
      "Handling 408 Request Timeout, failureCount: ",
      failureCount,
      ", retryValue: ",
      retryValue
    );
    return retryValue;
  }
  logger.info( "Handling some other error, failureCount: ", failureCount );
  handleError( error, { throw: false } );
  if ( error.status === 401 || error.status === 403 ) {
    // If we get a 401 or 403, call getJWT
    // which has a timestamp check if we need to refresh the token
    const token = await getJWT( );
    if ( token ) {
      return failureCount < 2;
    }
  }
  return false;
}

// eslint-disable-next-line import/prefer-default-export
export { inspect, reactQueryRetry };
