import { isObjectWithPrimitiveValues } from "sharedHelpers/runtimeTypeUtil";

// tl;dr: to support `extra`, we "wrap" certain input to react-native-logs and then "unwrap" it
// when handling it in our iNat-specific log handler

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

export const extraSentinelKey = "extraSentinelKey";

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

function enhanceLoggerWithExtra<T extends LoggerRoot>(
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

export default enhanceLoggerWithExtra;
