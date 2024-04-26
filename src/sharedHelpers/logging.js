import handleError from "api/error";
import { getJWT } from "components/LoginSignUp/AuthenticationService";
import RNFS from "react-native-fs";

import { log } from "../../react-native-logs.config";

const defaultLogger = log.extend( "logging.js" );

// returns string representation of an object, intended for debugging
function inspect( target ) {
  return JSON.stringify( target );
}

// Note that this should not be async. When you're using it with reactQuery,
// returning a promise is like returning true, which means it retries
// forever
function reactQueryRetry( failureCount, error, options = {} ) {
  const logger = options.logger || defaultLogger;
  if ( typeof ( options.beforeRetry ) === "function" ) {
    options.beforeRetry( failureCount, error );
  }
  logger.warn(
    `reactQueryRetry, error: ${error.message}, failureCount: ${failureCount}, options:`,
    options
  );
  let shouldRetry = failureCount < 2;
  if (
    // If this is an actual 408 Request Timeout error, we probably want to
    // retry... but this will probably never happen because at this point the
    // error hasn't been converted to an INatApiError
    error.status === 408
    // If there's just no network at the moment, definitely retry
    || ( error instanceof TypeError && error.message.match( "Network request failed" ) )
  ) {
    shouldRetry = failureCount < 3;
    logger.info(
      "reactQueryRetry, handling 408 Request Timeout / Network request failed, "
      + `failureCount: ${failureCount}, shouldRetry: ${shouldRetry}, options: `,
      options
    );
  }
  // 404 means the record does not exist, so no need to retry
  if ( error.status === 404 ) {
    shouldRetry = false;
    logger.info( "reactQueryRetry, handling 404, not retrying" );
  }
  handleError( error, {
    throw: false,
    onApiError: apiError => {
      if ( apiError.status === 401 || apiError.status === 403 ) {
        // If we get a 401 or 403, call getJWT
        // which has a timestamp check if we need to refresh the token
        logger.info( "reactQueryRetry, handling auth error, calling getJWT" );
        getJWT( );
      }
      // Consider handling 500+ errors differently. if you can detect them
      // before processing, you want to disable retry
    }
  } );
  return shouldRetry;
}

// https://stackoverflow.com/questions/15900485/correct-way-to-convert-size-in-bytes-to-kb-mb-gb-in-javascript
function formatSizeUnits( bytes ) {
  if ( bytes >= 1073741824 ) {
    bytes = `${( bytes / 1073741824 ).toFixed( 2 )} GB`;
  } else if ( bytes >= 1048576 ) {
    bytes = `${( bytes / 1048576 ).toFixed( 2 )} MB`;
  } else if ( bytes >= 1024 ) {
    bytes = `${( bytes / 1024 ).toFixed( 2 )} KB`;
  } else if ( bytes > 1 ) {
    bytes += " bytes";
  } else if ( bytes === 1 ) {
    bytes += " byte";
  } else {
    bytes = "0 bytes";
  }
  return bytes;
}

async function getAppSize( ) {
  const logger = defaultLogger;
  const directories = [
    {
      path: RNFS.MainBundlePath,
      directoryName: "MainBundle"
    },
    {
      path: RNFS.DocumentDirectoryPath,
      directoryName: "DocumentDirectory"
    },
    {
      path: RNFS.CachesDirectoryPath,
      directoryName: "CachesDirectory"
    },
    {
      path: RNFS.TemporaryDirectoryPath,
      directoryName: "TemporaryDirectory"
    }, {
      path: RNFS.LibraryDirectoryPath,
      directoryName: "LibraryDirectory"
    }
  ];

  directories.forEach( async ( { path, directoryName } ) => {
    const { size } = await RNFS.stat( path );

    logger.info( directoryName, "is", formatSizeUnits( size ) );
  } );
}

// eslint-disable-next-line import/prefer-default-export
export { getAppSize, inspect, reactQueryRetry };
