import RNFS from "react-native-fs";
import {
  fileAsyncTransport,
  logger
} from "react-native-logs";

const fileName = "inaturalist-rn-log.txt";
const logFilePath = `${RNFS.DocumentDirectoryPath}/${fileName}`;

RNFS.readDir( RNFS.DocumentDirectoryPath ).then( ( results => {
  results.forEach( result => {
    if ( result.name === fileName ) {
      RNFS.readFile( logFilePath ).then( fileContent => {
        console.log( fileContent, "content" );
      } );
    }
  } );
} ) );

const config = {
  // severity: "info",
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
