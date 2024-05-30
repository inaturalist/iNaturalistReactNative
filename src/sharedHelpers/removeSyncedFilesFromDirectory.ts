import RNFS from "react-native-fs";
// import { log } from "sharedHelpers/logger";

// const logger = log.extend( "removeSyncedFilesFromDirectory" );

const removeSyncedFilesFromDirectory = async ( directoryPath, filesToKeep = [] ) => {
  const directoryExists = await RNFS.exists( directoryPath );
  if ( !directoryExists ) { return null; }

  const files = await RNFS.readDir( directoryPath );

  return Promise.all( files.map( async ( { path, name } ) => {
    if ( filesToKeep.includes( name ) ) return;
    const pathExists = await RNFS.exists( path );
    if ( !pathExists ) return;
    // logger.info( "unlinking", path, "from", directoryPath );
    try {
      await RNFS.unlink( path );
    } catch ( unlinkError ) {
      if ( !unlinkError.message.match( /no such file/ ) ) throw unlinkError;
      // If we catch the no such file error, that's fine. We just want it gone.
    }
  } ) );
};

export default removeSyncedFilesFromDirectory;
