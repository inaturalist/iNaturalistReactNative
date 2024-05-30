import RNFS from "react-native-fs";
import { log } from "sharedHelpers/logger";
import { unlink } from "sharedHelpers/util";

const logger = log.extend( "removeSyncedFilesFromDirectory" );

const removeSyncedFilesFromDirectory = async ( directoryPath, filesToKeep = [] ) => {
  const directoryExists = await RNFS.exists( directoryPath );
  if ( !directoryExists ) { return null; }

  const files = await RNFS.readDir( directoryPath );

  return Promise.all( files.map( async ( { path, name } ) => {
    if ( filesToKeep.includes( name ) ) return;
    await unlink( path );
    logger.info( "unlinked", path, "from", directoryPath );
  } ) );
};

export default removeSyncedFilesFromDirectory;
