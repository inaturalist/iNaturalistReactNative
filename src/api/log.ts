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

// at least answers: does it look enough like an Error for logging purposes?
function isError( value: unknown ): value is { message?: string; stack?: string } {
  if ( value instanceof Error ) {
    return true;
  }
  if ( isObject( value ) && "stack" in value && "message" in value ) {
    return true;
  }
  return false;
}

// if we have anything that looks like:
// [someObj, 'asdfasdf', 3, { extra: { id: 1, ... } }]
// where the _last_ rest param is an obj w/ exaclty one `extra` property w/ primitive fields,
// we infer that last item as intended for the special `extra` API field
// we return that separately and strip it from the "normal" rest params for later handling
function extractExtra( rawMsg: unknown ) {
  const nonExtraResult = {
    messageParams: rawMsg,
    extra: undefined,
  };

  // make sure we least look like [...someItems, maybeExtra]
  if ( !Array.isArray( rawMsg ) || rawMsg.length < 2 ) {
    return nonExtraResult;
  }
  // make sure maybeExtra looks like { extra: ??? }
  const extraWrapperCandidate = rawMsg.at( -1 );
  if (
    !isObject( extraWrapperCandidate )
    // limit to _exactly_ just this property to minimize accidentally classifying `extra`
    || Object.keys( extraWrapperCandidate ).length !== 1
    || !( "extra" in extraWrapperCandidate )
  ) {
    return nonExtraResult;
  }
  // make sure our extra is actually valid for the API
  const { extra: extraCandidate } = extraWrapperCandidate;
  if ( !isObjectWithPrimitiveValues( extraCandidate ) ) {
    console.warn( "[ERROR log.ts] `extra` must be a non-nested object with primitive values" );
    return nonExtraResult;
  }
  return {
    // the rest of the log handling should act as if extra was separate from the rest params
    messageParams: rawMsg.slice( 0, -1 ),
    extra: extraCandidate,
  };
}

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

  // pull potential `extra` out of the rest params
  const { messageParams, extra } = extractExtra( props.rawMsg );

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
    level: props.level.text,
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
