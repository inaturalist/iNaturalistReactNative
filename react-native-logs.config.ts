import * as RNFS from "@dr.pogodin/react-native-fs";
import iNatLogstashTransport, { enhanceLoggerWithExtra } from "api/log";
import {
  consoleTransport,
  fileAsyncTransport,
  logger,
} from "react-native-logs";

// before introducing {date-today} rolling logs, we had a single logfile
// we still want to allow users to retreive this logfile but heads up, they may be _big_ like 100MB
const legacyLogfileName = "inaturalist-rn-log.txt";
export const legacyLogfilePath = `${RNFS.DocumentDirectoryPath}/${legacyLogfileName}`;

export const logFileNamePrefix = "inaturalist-rn-log";
const logFileName = `${logFileNamePrefix}.{date-today}.txt`;

export const logFileDirectory = `${RNFS.DocumentDirectoryPath}/logs`;

RNFS.exists( logFileDirectory ).then( exists => ( exists
  ? Promise.resolve()
  : RNFS.mkdir( logFileDirectory ) ) );

const sharedConfig = {
  dateFormat: "iso",
  // eslint-disable-next-line no-undef
  severity: __DEV__
    ? "debug"
    : "info",
  transportOptions: {
    // TS TODO: this type is "fixed" in next minor version bump of rn-logs
    // https://github.com/mowispace/react-native-logs/commit/df7444279525b7fa88c1509655d8fb6e7582b9cb#diff-c7efff41b2f47cae54e9c83fbe3156db0f1ef1bf405e0750c94d6a10bb74e5a0L110
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    FS: RNFS as any,
    fileName: logFileName,
    filePath: logFileDirectory,
    // logname.{date-today}.txt => logname.2026-3-11.txt (note, no padded 0)
    fileNameDateType: "iso" as const,
  },
};

const baseLog = logger.createLogger( {
  ...sharedConfig,
  transport: [
    consoleTransport,
    fileAsyncTransport,
    iNatLogstashTransport,
  ],
} );

// given the general react-native-logs logger with debug(), warn(), etx,
// add wrappers for debugWithExtra(), etc which provides more intentional
// log interfaces for the iNatLogstash API `extra` proprty. `iNatLogstashTransport`
// handles this extra data specially while other transports treat it as any other normal
// log param.
export const log = enhanceLoggerWithExtra( baseLog );

export const logWithoutRemote = logger.createLogger( {
  ...sharedConfig,
  transport: [
    consoleTransport,
    fileAsyncTransport,
  ],
} );
