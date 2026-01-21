import iNatLogstashTransport from "api/log";
import RNFS from "react-native-fs";
import {
  consoleTransport,
  fileAsyncTransport,
  logger,
} from "react-native-logs";

const fileName = "inaturalist-rn-log.txt";
const logFilePath = `${RNFS.DocumentDirectoryPath}/${fileName}`;

const transport = [];
transport.push( consoleTransport );
transport.push( fileAsyncTransport );
transport.push( iNatLogstashTransport );

const config = {
  dateFormat: "iso",
  // eslint-disable-next-line no-undef
  severity: __DEV__
    ? "debug"
    : "info",
  transport,
  transportOptions: {
    // TS TODO: this type is "fixed" in next minor version bump of rn-logs
    // https://github.com/mowispace/react-native-logs/commit/df7444279525b7fa88c1509655d8fb6e7582b9cb#diff-c7efff41b2f47cae54e9c83fbe3156db0f1ef1bf405e0750c94d6a10bb74e5a0L110
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    FS: RNFS as any,
    fileName,
  },
};

const log = logger.createLogger( config );

const logWithoutRemote = logger.createLogger( {
  ...config,
  transport: [consoleTransport, fileAsyncTransport],
} );

export {
  log,
  logFilePath,
  logWithoutRemote,
};
