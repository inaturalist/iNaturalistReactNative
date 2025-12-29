import RNFS from "react-native-fs";
import { log } from "sharedHelpers/logger";
import { unlink } from "sharedHelpers/util";

import { sentinelFilePath } from "../appConstants/paths";

const logger = log.extend( "sentinelFiles" );

const accessFullFilePath = ( fileName: string ) => `${sentinelFilePath}/${fileName}`;

const generateSentinelFileName = ( screenName: string ): string => {
  const timestamp = new Date().getTime();
  return `sentinel_${screenName}_${timestamp}.log`;
};

const createSentinelFile = async ( screenName: string ): Promise<string> => {
  try {
    await RNFS.mkdir( sentinelFilePath );
    const sentinelFileName = generateSentinelFileName( screenName );

    const logEntry = {
      screenName,
      entryTimestamp: new Date( ).toISOString( ),
      stages: [],
    };

    const initialContent = JSON.stringify( logEntry );

    await RNFS.writeFile( accessFullFilePath( sentinelFileName ), initialContent, "utf8" );
    return sentinelFileName;
  } catch ( error ) {
    console.error( "Failed to create sentinel file:", error );
    return "";
  }
};

const logStage = async (
  sentinelFileName: string,
  stageName: string,
): Promise<void> => {
  const fullFilePath = accessFullFilePath( sentinelFileName );
  try {
    const existingContent = await RNFS.readFile( fullFilePath, "utf8" );
    const sentinelData = JSON.parse( existingContent );

    const stage = {
      name: stageName,
      timestamp: new Date( ).toISOString( ),
    };

    sentinelData.stages.push( stage );

    await RNFS.writeFile( fullFilePath, JSON.stringify( sentinelData ), "utf8" );
  } catch ( error ) {
    console.log( error, sentinelFileName, stageName, "Failed to log stage to sentinel file" );
    console.error( "Failed to log stage to sentinel file:", error, sentinelFileName, stageName );
  }
};

const deleteSentinelFile = async ( sentinelFileName: string ): Promise<void> => {
  try {
    const fullFilePath = accessFullFilePath( sentinelFileName );
    await RNFS.unlink( fullFilePath );
  } catch ( error ) {
    console.error( "Failed to delete sentinel file:", error, sentinelFileName );
  }
};

const findAndLogSentinelFiles = async ( ) => {
  const directoryExists = await RNFS.exists( sentinelFilePath );
  if ( !directoryExists ) { return null; }
  const files = await RNFS.readDir( sentinelFilePath );

  files.forEach( async file => {
    const existingContent = await RNFS.readFile( file.path, "utf8" );

    const sentinelData = JSON.parse( existingContent );
    if ( sentinelData.stages && sentinelData.stages.length > 0 ) {
      logger.error( "Camera flow error: ", existingContent );
    }
    await unlink( file.path );
  } );
  return files;
};

export {
  createSentinelFile,
  deleteSentinelFile,
  findAndLogSentinelFiles,
  logStage,
};
