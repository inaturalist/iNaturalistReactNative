import RNFS from "react-native-fs";
import {
  consoleTransport,
  fileAsyncTransport,
  logger
} from "react-native-logs";

const fileName = "inaturalist-rn-log.txt";
const logFilePath = `${RNFS.DocumentDirectoryPath}/${fileName}`;

// Configure without transport for test. If you want to write output during
// tests, use console.log
const transport = [];
if ( process?.env?.NODE_ENV !== "test" ) {
  transport.push( consoleTransport );
  transport.push( fileAsyncTransport );
}

const config = {
  dateFormat: "iso",
  // eslint-disable-next-line no-undef
  severity: __DEV__
    ? "debug"
    : "info",
  transport,
  transportOptions: {
    FS: RNFS,
    fileName
  }
};

const log = logger.createLogger( config );

export {
  log,
  logFilePath
};
