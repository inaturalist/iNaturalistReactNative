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
    FS: RNFS,
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
