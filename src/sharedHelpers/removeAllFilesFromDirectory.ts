import RNFS from "react-native-fs";
import { unlink } from "sharedHelpers/util";

const removeAllFilesFromDirectory = async directoryPath => {
  const directoryExists = await RNFS.exists( directoryPath );
  if ( !directoryExists ) { return null; }
  const files = await RNFS.readDir( directoryPath );
  return Promise.all( files.map( unlink ) );
};

export default removeAllFilesFromDirectory;
