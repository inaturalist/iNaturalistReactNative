import RNFS from "react-native-fs";
import { log } from "sharedHelpers/logger";

const logger = log.extend( "removeAllFilesFromDirectory" );

const removeAllFilesFromDirectory = async directoryPath => {
  const directoryExists = await RNFS.exists( directoryPath );
  if ( !directoryExists ) { return null; }
  const files = await RNFS.readDir( directoryPath );

  const clearDirectory = files.forEach( async ( { path } ) => {
    const pathExists = await RNFS.exists( path );
    if ( !pathExists ) { return; }
    logger.info( "unlinking", path, "from", directoryPath );
    await RNFS.unlink( path );
  } );
  return clearDirectory;
};

export default removeAllFilesFromDirectory;
