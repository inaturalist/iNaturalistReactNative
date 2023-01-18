import { getUserAgent } from "api/userAgent";
import { create } from "apisauce";
import Config from "react-native-config";
import RNFS from "react-native-fs";
import {
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

const config = {
  transport: [
    fileAsyncTransport,
    iNatLogstashTransport
  ],
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
