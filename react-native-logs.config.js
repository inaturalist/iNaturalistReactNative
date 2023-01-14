import RNFS from "react-native-fs";
import {
  fileAsyncTransport,
  logger
} from "react-native-logs";

const fileName = "inaturalist-rn-log.txt";
const logFilePath = `${RNFS.DocumentDirectoryPath}/${fileName}`;

const config = {
  transport: fileAsyncTransport,
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
