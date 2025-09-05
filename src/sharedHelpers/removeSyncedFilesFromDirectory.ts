import RNFS from "react-native-fs";
import { unlink } from "sharedHelpers/util";

const TRASHABLE_VINTAGE_MS
  = 1000 // 1 second
  * 60 // 1 minute
  * 60 // 1 hour
  * 24 // 1 day
  * 30; // 1 month

const MAX_FOLDER_SIZE = 5 * 1024 * 1024 * 1024; // 5GB in bytes
const TOO_NEW_THRESHOLD = 24 * 60 * 60 * 1000; // Files modified in the last 1 day (in milliseconds)

type FileDetails = {
  name: string,
  path: string,
  size: number,
  modifiedTime: number
};

const removeSyncedFilesFromDirectory = async (
  directoryPath: string,
  filesToKeep: string[] = []
) => {
  const directoryExists = await RNFS.exists( directoryPath );
  if ( !directoryExists ) {
    return null;
  }

  const files = await RNFS.readDir( directoryPath );
  let totalSize = 0;
  const fileDetails: FileDetails[] = [];
  const deletionPromises = Promise.all(
    files.map( async file => {
      let skipFile = false;

      if ( file.mtime ) {
        const age = Date.now() - file.mtime.getTime();
        // If this is too fresh to delete, skip. Maybe the file got writte
        // before the observation was written to realm and we're going to need
        // it in a few seconds
        if ( age < TRASHABLE_VINTAGE_MS ) {
          skipFile = true;
        }
      }
      const { name, path } = file;

      if ( filesToKeep.includes( name ) ) {
        skipFile = true;
      }

      if ( skipFile ) {
        const fileStat = await RNFS.stat( file.path );
        totalSize += fileStat.size;
        fileDetails.push( {
          name,
          path: file.path,
          size: fileStat.size,
          modifiedTime: fileStat.mtime
        } );

        return;
      }

      console.log( `Deleting old file: ${path}` );
      await unlink( path );
    } )
  );

  if ( totalSize <= MAX_FOLDER_SIZE ) {
    return deletionPromises;
  }

  // Folder size is still too big - delete the oldest biggest files first

  console.log( `Folder size exceeds limit. Current size: ${totalSize} bytes` );

  // Filter out files that are to be kept (e.g. unsynced files)
  let deletableFiles = fileDetails.filter( file => !filesToKeep.includes( file.name ) );

  // Filter out files that are too new
  const now = Date.now();
  deletableFiles = deletableFiles.filter(
    file => now - new Date( file.modifiedTime ).getTime() >= TOO_NEW_THRESHOLD
  );

  // Sort files by size (descending) and modified time (ascending)
  deletableFiles.sort( ( a, b ) => b.size - a.size || a.modifiedTime - b.modifiedTime );

  // Keep deleting files until we're below the max folder threshold
  let reducedSize = totalSize;

  const filesToDelete:string[] = [];

  deletableFiles.forEach( file => {
    if ( reducedSize <= MAX_FOLDER_SIZE ) return;

    console.log( `Deleted: ${file.path} (${file.size} bytes)` );
    reducedSize -= file.size;
    filesToDelete.push( file.path );
  } );

  if ( reducedSize > MAX_FOLDER_SIZE ) {
    console.warn( "Unable to reduce folder size below threshold with current rules." );
  } else {
    console.log( `Folder size is now under limit: ${reducedSize} bytes` );
  }

  return Promise.all(
    [deletionPromises, ...filesToDelete.map( async path => RNFS.unlink( path ) )]
  );
};

export default removeSyncedFilesFromDirectory;
