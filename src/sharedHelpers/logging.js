import handleError from "api/error";
import { getJWT } from "components/LoginSignUp/AuthenticationService.ts";

import { log } from "../../react-native-logs.config";

const defaultLogger = log.extend( "logging.js" );

// returns string representation of an object, intended for debugging
function inspect( target ) {
  return JSON.stringify( target );
}

function handleRetryDelay( failureCount, error ) {
  // Special handling for 429 errors - use exponential backoff
  if ( error.status === 429 || ( error.response && error.response.status === 429 ) ) {
    const baseDelay = 1000;
    const exponentialDelay = baseDelay * 2 ** failureCount;
    const jitter = Math.random() * 100; // Add randomness
    return exponentialDelay + jitter; // Progressive backoff
  }

  // Default React Query retry delay for other errors
  return Math.min( 1000 * 2 ** failureCount, 30000 );
}

function handleTooManyRequestsErrors( failureCount, error, options = {} ) {
  const errorContext = {
    queryKey: options?.queryKey
      ? inspect( options.queryKey )
      : "unknown",
    failureCount,
    timestamp: new Date().toISOString(),
    errorType: error?.name || "Unknown",
    status: error?.status || ( error.response
      ? error.response.status
      : null ),
    url: error?.response?.url,
    routeName: options?.routeName || error?.routeName,
    routeParams: options?.routeParams || error?.routeParams
  };

  if ( error.status === 429 || ( error.response && error.response.status === 429 ) ) {
    defaultLogger.error(
      "429 in reactQueryRetry:",
      errorContext
    );

    // Use progressive backoff for rate limit errors using handleRetryDelay;
    // wait longer between retries
    const shouldRetry = failureCount < 3;

    // Let the error handler know this was a rate limit error but don't throw to allow retry
    handleError( error, {
      throw: false,
      context: errorContext,
      onApiError: apiError => {
        console.log( apiError, "API error in reactQueryRetry handleTooManyRequestsErrors" );
      }
    } );

    return shouldRetry;
  }
  return null;
}

// Note that this should not be async. When you're using it with reactQuery,
// returning a promise is like returning true, which means it retries
// forever
function reactQueryRetry( failureCount, error, options = {} ) {
  const isOffline = error instanceof TypeError && error.message.match( "Network request failed" );
  const logger = options.logger || defaultLogger;

  // trying to get more context in Grafana for TooManyRequests errors
  const rateLimitRetryDecision = handleTooManyRequestsErrors( failureCount, error, options );
  if ( rateLimitRetryDecision !== null ) {
    return rateLimitRetryDecision;
  }

  if ( typeof ( options.beforeRetry ) === "function" ) {
    options.beforeRetry( failureCount, error );
  }
  logger.warn(
    `reactQueryRetry, error: ${error.message}, failureCount: ${failureCount}, options:`,
    inspect( options?.queryKey )
  );
  let shouldRetry = failureCount < 2;
  if (
    // If this is an actual 408 Request Timeout error, we probably want to
    // retry... but this will probably never happen because at this point the
    // error hasn't been converted to an INatApiError
    error.status === 408 || isOffline
  ) {
    shouldRetry = failureCount < 3;
    console.log(
      "reactQueryRetry, handling 408 Request Timeout / Network request failed, "
      + `failureCount: ${failureCount}, shouldRetry: ${shouldRetry}, options: `,
      options
    );
    // 20240905 amanda - not handling error here since we want these queries to retry
    // immediately if there is an internet connection
    // though i'm also not sure if we need to log these network request failed errors somewhere
    // or if it's ok to suppress them
    return shouldRetry;
  }
  // 404 means the record does not exist, so no need to retry
  if ( error.status === 404 ) {
    shouldRetry = false;
    console.log( "reactQueryRetry, handling 404, not retrying" );
  }
  handleError( error, {
    throw: false,
    onApiError: async apiError => {
      if ( apiError.status === 401 || apiError.status === 403 ) {
        // If we get a 401 or 403, call getJWT
        // which has a timestamp check if we need to refresh the token
        logger.error( "JWT error detected in React Query retry:", {
          queryKey: options?.queryKey
            ? inspect( options.queryKey )
            : "unknown",
          url: error?.response?.url,
          routeName: options?.routeName || error?.routeName,
          timestamp: new Date().toISOString()
        } );

        try {
          await getJWT( true ); // Force refresh token
        } catch ( refreshError ) {
          logger.error( "Error refreshing JWT during retry:", refreshError );
        }
      }
      // Consider handling 500+ errors differently. if you can detect them
      // before processing, you want to disable retry
    }
  } );
  return shouldRetry;
}

// eslint-disable-next-line import/prefer-default-export
export {
  handleRetryDelay,
  inspect,
  reactQueryRetry
};
