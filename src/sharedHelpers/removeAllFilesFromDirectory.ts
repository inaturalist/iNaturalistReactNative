import { exists, readDir } from "@dr.pogodin/react-native-fs";
import { unlink } from "sharedHelpers/util";

const removeAllFilesFromDirectory = async ( directoryPath: string ) => {
  const directoryExists = await exists( directoryPath );
  if ( !directoryExists ) { return null; }
  const files = await readDir( directoryPath );
  return Promise.all( files.map( file => unlink( file.path ) ) );
};

export default removeAllFilesFromDirectory;
