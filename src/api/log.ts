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

const extraSentinelKey = "extraSentinelKey";

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
    || !( extraSentinelKey in extraWrapperCandidate )
  ) {
    return nonExtraResult;
  }
  // make sure our extra is actually valid for the API
  const extraCandidate = extraWrapperCandidate[extraSentinelKey];
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

// tl;dr: to support `extra`, we "wrap" certain input to react-native-logs and then "unwrap" it
// when handling it in our iNat-specific log handler. lil janky.

// iNat's /log REST API supports an `extra` field for sending structured data
// in addition to the log message.
// The logging API exposed by react-native-logs is entirely based on rest params,
// making it difficult for our log transport to identify "what" is intented to be treated as `extra`
// since a function signature can't have any parameter _after_ a rest parameter.

// We don't want to compromise our use of rn-logs for other transports (console, fs, future others)
// BUT we also want to make it so that our "special" case for the iNat transport is
// 1) user-discoverable 2) safe (or as safe as we can get)

// The following is probably overkill, but it makes me feel better about hiding the "magic"
// case for `extra` from developer code.

// The following exposes a "enhancer" function which takes a rn-logs logger (from createLogger)
// that looks like:

// {
//   debug: (...params) => void,
//   info: (...params) => void,
//   ... and so on
//   extend: (namespace) => {
//     debug: (...params) => void,
//     info: (...params) => void,
//     ... and so on
//   }
//   ...other logger helpers
// }

// and returns that logger with the additional `[level]WithExtra` functions:

// {
//   debug: (...params) => void,
//   debugWithExtra: (...params) => void,
//   info: (...params) => void,
//   infoWithExtra: (...params) => void,
//   ... and so on
//   extend: (namespace) => {
//     debug: (...params) => void,
//     debugWithExtra: (...params) => void,
//     info: (...params) => void,
//     infoWithExtra: (...params) => void,
//     ... and so on
//   }
//   ...other logger helpers
// }

// The `[log]WithExtra`s are passthrus to the default `[log]`s but with some runtime validation
// to make sure the last param is acceptable for iNat's `extra` field. They also wrap that argument
// in an object with an internal / "magic" property name. This is to allow the transport to more
// safely interpret a log param as being intented as an extra since the transport handles generic
// input. That is:
// log.infoWithExtra(1, 2, 3, { userId: 0 })
// becomes
// [1, 2, 3, { [magicExtraKey]: { userId: 0 }}]
// The trasport looks at its args, sees if the last one is a `{ [magicKey]: {} }` and if so,
// separates that value from the rest of the log args as if it was indeed passed separately. The log
// API would receive: { message, "1 2 3", extra: { userId: 0 } }

// Other transports, like the console, will treat this wrapped value as any other log argument.

type LoggingFunction = ( ...args: unknown[] ) => void;

interface Logger {
  debug: LoggingFunction;
  info: LoggingFunction;
  warn: LoggingFunction;
  error: LoggingFunction;
}
type LoggerWithExtra = Logger & {
  debugWithExtra: LoggingFunction;
  infoWithExtra: LoggingFunction;
  warnWithExtra: LoggingFunction;
  errorWithExtra: LoggingFunction;
}

type LoggerRoot = Logger & { extend: ( extension: string ) => Logger }
type LoggerWithExtraRoot = LoggerWithExtra & { extend: ( extension: string ) => LoggerWithExtra }

const extractExtraForLogWrapper = ( rawMsg: unknown ) => {
  // make sure we least look like [...someItems, maybeExtra]
  if ( !Array.isArray( rawMsg ) || rawMsg.length < 2 ) {
    return null;
  }
  // make sure maybeExtra is an object w/ primitive values
  const extraCandidate = rawMsg.at( -1 );
  if ( !isObjectWithPrimitiveValues( extraCandidate )
  ) {
    return null;
  }
  return { [extraSentinelKey]: extraCandidate };
};

const wrapLogFunctionWithExtra = (
  baseLogFunc: ( ( ...args: unknown[] ) => void ),
  key: string,
) => {
  const logWithExtraFunc = ( ...argsWithExtra: unknown[] ) => {
    const extra = extractExtraForLogWrapper( argsWithExtra );
    if ( extra === null ) {
      const errorMessage = [
        `Invalid Argument: ${key}WithExtra()'s last argument must be an object `,
        "with only primitive values in order to be used as an `extra` for iNat's log API. ",
        `Did you mean to call ${key}()? Falling back to default log function.`,
      ].join( "" );
      console.error( errorMessage );

      // log w/ default behavior regardless
      baseLogFunc( ...argsWithExtra );
    } else {
      const wrappedParams = [
        ...argsWithExtra.slice( 0, -1 ),
        extra,
      ];
      baseLogFunc( ...wrappedParams );
    }
  };

  return logWithExtraFunc;
};

const enhanceLogRootWithExtras = ( logger: Logger ) => ( {
  ...logger,
  debugWithExtra: wrapLogFunctionWithExtra( logger.debug, "debug" ),
  infoWithExtra: wrapLogFunctionWithExtra( logger.info, "info" ),
  warnWithExtra: wrapLogFunctionWithExtra( logger.warn, "warn" ),
  errorWithExtra: wrapLogFunctionWithExtra( logger.error, "error" ),
} );

// eslint-disable-next-line arrow-body-style
const wrapLogExtendWithExtra = ( extendFunc: ( extension: string ) => Logger ) => {
  return ( extension: string ) => {
    const logWithExtras = extendFunc( extension );
    return enhanceLogRootWithExtras( logWithExtras );
  };
};

export function enhanceLoggerWithExtra<T extends LoggerRoot>(
  baseLog: T,
  // we need to omit the original `extend` from the original log
  // so that it doesn't influence our new `extend`
): Omit<T, "extend"> & LoggerWithExtraRoot {
  const log = {
    ...baseLog,
    ...enhanceLogRootWithExtras( baseLog ),
    extend: wrapLogExtendWithExtra( baseLog.extend ),
  };
  return log;
}

export default iNatLogstashTransport;
