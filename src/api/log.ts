import { getUserAgent } from "api/userAgent";
import { create } from "apisauce";
// eslint-disable-next-line import/no-cycle
import { getAnonymousJWT, getJWT } from "components/LoginSignUp/AuthenticationService";
import Config from "react-native-config";
import type { transportFunctionType } from "react-native-logs";
import { getInstallID } from "sharedHelpers/installData";
import { isObject, isObjectWithPrimitiveValues } from "sharedHelpers/runtimeTypeUtil";

const API_HOST: string
    = Config.API_URL || process.env.API_URL || "https://api.inaturalist.org/v2";

const api = create( {
  baseURL: API_HOST,
  headers: {
    "User-Agent": getUserAgent( ),
    "X-Installation-ID": getInstallID( ),
  },
} );

// at least: does it look enough like an Error for logging purposes
function isError( value: unknown ): value is { message?: string; stack?: string } {
  if ( value instanceof Error ) {
    return true;
  }
  if ( isObject( value ) && "stack" in value && "message" in value ) {
    return true;
  }
  return false;
}

const withExtraSuffix = "WithExtra";

// our transport has no options but this needs to be explicitly `object` for generic typing
type iNatLogstashTransportOptions = object;
// Custom transport for posting to iNat API logging
const iNatLogstashTransport: transportFunctionType<iNatLogstashTransportOptions> = async props => {
  // Don't bother to log from dev builds
  // eslint-disable-next-line no-undef
  if ( __DEV__ ) return;

  // Note on `console.errors`: we use logging to report errors, so validating input
  // and making sure we have an auth token are some of a few cases where we really do want
  // to squelch all errors to avoid recursion

  const level = props.level.text;

  let messageParams = props.rawMsg;
  let extra;

  // if the `WithExtra` variant of a log function is called, we treat the last
  // rest parameter as the extra object as if it'd been called as a separate argument
  // This is going to change immediately, I'm just using this earlier implementation
  // as a functional checkpoint.
  // ----
  // handle this validation before anything else because this should _ideally_ be a
  // (loud) dev-only issue _noticed_ in dev.
  // we also want to massage `rawMsg` first to account for standard non-extra args
  if ( level.endsWith( withExtraSuffix ) ) {
    const hasValidWithExtraArguments = Array.isArray( props.rawMsg )
      && props.rawMsg.length >= 2
      && isObjectWithPrimitiveValues( props.rawMsg.at( -1 ) );

    if ( !hasValidWithExtraArguments ) {
      console.error( `[ERROR log.ts] Invalid Arguments for ${level}` );
      return;
    }
    // we've validated the last arg from params is _correctly_ a valid `extra` object
    // so grab that and slice every param _except_ that one for further params handling
    // eslint-disable-next-line prefer-destructuring
    extra = ( props.rawMsg as unknown[] ).at( -1 );
    messageParams = ( props.rawMsg as unknown[] ).slice( 0, -1 );
  } else {
    // otherwise, every param should be treated as part of the message
    messageParams = props.rawMsg;
  }

  let userToken;
  try {
    userToken = await getJWT();
  } catch ( _getJWTError ) {
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
  if ( typeof ( messageParams ) === "string" ) {
    message = messageParams;
  } else if ( isError( messageParams ) ) {
    // eslint-disable-next-line prefer-destructuring
    message = messageParams;
    errorType = messageParams.constructor?.name;
    backtrace = messageParams.stack;
  } else if ( Array.isArray( messageParams ) ) {
    // specially handle the cases where the last arg is
    // an error: so we can attach appropriate error metadata
    const last = messageParams.at( -1 );
    if ( isError( last ) ) {
      // eslint-disable-next-line prefer-destructuring
      message = last.message;
      errorType = last.constructor?.name;
      backtrace = last.stack;
    } else {
      message = messageParams.join( " " );
    }
  } else {
    message = messageParams;
  }
  const formData = {
    level: level.replace( withExtraSuffix, "" ),
    message,
    context: props.extension,
    extra,
    timestamp: new Date().toISOString(),
    error_type: errorType,
    backtrace,
  };
  try {
    await api.post( "/log", formData, {
      headers: {
        Authorization: [
          userToken,
          anonymousToken,
        ].flat( ).join( ", " ),
      },
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
