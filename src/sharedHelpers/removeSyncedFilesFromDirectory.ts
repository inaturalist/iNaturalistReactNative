import RNFS from "react-native-fs";
import { log } from "sharedHelpers/logger";

const logger = log.extend( "removeSyncedFilesFromDirectory" );

const removeSyncedFilesFromDirectory = async ( directoryPath, unsyncedFiles ) => {
  const directoryExists = await RNFS.exists( directoryPath );
  if ( !directoryExists ) { return null; }

  const files = await RNFS.readDir( directoryPath );

  const clearSynced = files.forEach( async ( { path, name } ) => {
    const pathExists = await RNFS.exists( path );
    if ( !pathExists ) { return; }
    if ( unsyncedFiles.includes( name ) ) {
      return;
    }
    logger.info( "unlinking", path, "from", directoryPath );
    await RNFS.unlink( path );
  } );
  return clearSynced;
};

export default removeSyncedFilesFromDirectory;
