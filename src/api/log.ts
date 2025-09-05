import { getUserAgent } from "api/userAgent";
import { create } from "apisauce";
// eslint-disable-next-line import/no-cycle
import { getAnonymousJWT, getJWT } from "components/LoginSignUp/AuthenticationService";
import Config from "react-native-config";
import { transportFunctionType } from "react-native-logs";
import { getInstallID } from "sharedHelpers/installData";

const API_HOST: string
    = Config.API_URL || process.env.API_URL || "https://api.inaturalist.org/v2";

const api = create( {
  baseURL: API_HOST,
  headers: {
    "User-Agent": getUserAgent( ),
    "X-Installation-ID": getInstallID( )
  }
} );

function isError( error: { message?: string, stack?: string } ) {
  if ( error instanceof Error ) return true;
  if ( error?.stack && error?.message ) return true;
  return false;
}

// Custom transport for posting to iNat API logging
const iNatLogstashTransport: transportFunctionType = async props => {
  // Don't bother to log from dev builds
  // eslint-disable-next-line no-undef
  if ( __DEV__ ) return;
  let userToken;
  try {
    userToken = await getJWT();
  } catch ( _getJWTError ) {
    // We use logging to report errors, so this is one of the few cases where
    // we really do want to squelch all errors to avoid recursion
    console.error( "[ERROR log.ts] failed to retrieve user JWT while logging" );
  }
  const anonymousToken = getAnonymousJWT();
  // Can't log w/o auth token
  if ( !userToken && !anonymousToken ) {
    console.error( "[ERROR log.ts] failed to retrieve user or anonymous JWT while logging" );
    return;
  }
  // if message is an Error or is an array ending in an error, extract
  // error_type and backtrace
  let message;
  let backtrace;
  let errorType;
  if ( typeof ( props.rawMsg ) === "string" ) {
    message = props.rawMsg;
  } else if ( isError( props.rawMsg ) ) {
    ( { message } = props.rawMsg );
    errorType = props.rawMsg.constructor?.name;
    backtrace = props.rawMsg.stack;
  } else if ( Array.isArray( props.rawMsg ) ) {
    const last = props.rawMsg.at( -1 );
    if ( isError( last ) ) {
      ( { message } = last );
      errorType = last.constructor?.name;
      backtrace = last.stack;
    } else {
      message = props.rawMsg.join( " " );
    }
  } else {
    message = props.rawMsg;
  }
  const formData = {
    level: props.level.text,
    message,
    context: props.extension,
    timestamp: new Date().toISOString(),
    error_type: errorType,
    backtrace
  };
  try {
    await api.post( "/log", formData, {
      headers: {
        Authorization: [
          userToken,
          anonymousToken
        ].flat( ).join( ", " )
      }
    } );
  } catch ( e ) {
    const postLogError = e as Error;
    if ( postLogError.message.match( /Network request failed/ ) ) {
      // If we're offline, we can't post logs to the server
      return;
    }
    throw postLogError;
  }
};

export default iNatLogstashTransport;
