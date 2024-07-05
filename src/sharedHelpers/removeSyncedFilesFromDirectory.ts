import RNFS from "react-native-fs";
import { unlink } from "sharedHelpers/util";

const removeSyncedFilesFromDirectory = async (
  directoryPath: string,
  filesToKeep: string[] = []
) => {
  const directoryExists = await RNFS.exists( directoryPath );
  if ( !directoryExists ) { return null; }

  const files = await RNFS.readDir( directoryPath );

  return Promise.all( files.map( async ( { path, name } ) => {
    if ( filesToKeep.includes( name ) ) return;
    await unlink( path );
  } ) );
};

export default removeSyncedFilesFromDirectory;
