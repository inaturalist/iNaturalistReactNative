import RNFS from "react-native-fs";
import { unlink } from "sharedHelpers/util.ts";

const TRASHABLE_VINTAGE_MS = (
  1000 // 1 second
  * 60 // 1 minute
  * 60 // 1 hour
  * 24 // 1 day
);

const removeSyncedFilesFromDirectory = async (
  directoryPath: string,
  filesToKeep: string[] = []
) => {
  const directoryExists = await RNFS.exists( directoryPath );
  if ( !directoryExists ) { return null; }

  const files = await RNFS.readDir( directoryPath );

  return Promise.all( files.map( async file => {
    if ( file.mtime ) {
      const age = Date.now() - file.mtime.getTime( );
      // If this is too fresh to delete, skip. Maybe the file got writte
      // before the observation was written to realm and we're going to need
      // it in a few seconds
      if ( age < TRASHABLE_VINTAGE_MS ) return;
    }
    const { name, path } = file;
    if ( filesToKeep.includes( name ) ) return;
    await unlink( path );
  } ) );
};

export default removeSyncedFilesFromDirectory;
