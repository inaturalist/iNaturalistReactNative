import { getUserAgent } from "api/userAgent";
import { create } from "apisauce";
import Config from "react-native-config";
import RNFS from "react-native-fs";
import {
  consoleTransport,
  fileAsyncTransport,
  logger
} from "react-native-logs";

const fileName = "inaturalist-rn-log.txt";
const logFilePath = `${RNFS.DocumentDirectoryPath}/${fileName}`;

const API_HOST: string = Config.API_URL || process.env.API_URL || "https://api.inaturalist.org/v2";

// Custom transport for posting to iNat API logging
const iNatLogstashTransport = props => {
  const api = create( {
    baseURL: API_HOST,
    headers: { "User-Agent": getUserAgent( ) }
  } );
  const msg = typeof ( props.rawMsg ) === "string"
    ? props.rawMsg
    : props.rawMsg.join( " " );
  api.get(
    `/log?msg=${msg}&level=${props.level.text}&extension=${props.extension}`
  );
};

// Configure without transport for test. If you want to write output during
// tests, use console.log
const transport = [];
if ( process?.env?.NODE_ENV !== "test" ) {
  transport.push( consoleTransport );
  transport.push( fileAsyncTransport );
  transport.push( iNatLogstashTransport );
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
