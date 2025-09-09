import RNFS from "react-native-fs";
import { unlink } from "sharedHelpers/util";

const removeAllFilesFromDirectory = async ( directoryPath: string ) => {
  const directoryExists = await RNFS.exists( directoryPath );
  if ( !directoryExists ) { return null; }
  const files = await RNFS.readDir( directoryPath );
  return Promise.all( files.map( file => unlink( file.path ) ) );
};

export default removeAllFilesFromDirectory;
