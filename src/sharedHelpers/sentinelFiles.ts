import RNFS from "react-native-fs";

import { sentinelFilePath } from "../appConstants/paths";

const accessFullFilePath = fileName => `${sentinelFilePath}/${fileName}`;

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
      stages: []
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
  stageName: string
): Promise<void> => {
  const fullFilePath = accessFullFilePath( sentinelFileName );
  try {
    const existingContent = await RNFS.readFile( fullFilePath, "utf8" );
    const sentinelData = JSON.parse( existingContent );

    const stage = {
      name: stageName,
      timestamp: new Date( ).toISOString( )
    };

    sentinelData.stages.push( stage );

    await RNFS.writeFile( fullFilePath, JSON.stringify( sentinelData ), "utf8" );
    console.log( "Logged stage to sentinel file:", sentinelFileName, stageName );
  } catch ( error ) {
    console.error( "Failed to log stage to sentinel file:", error, sentinelFileName, stageName );
  }
};

const deleteSentinelFile = async ( sentinelFileName: string ): Promise<void> => {
  try {
    const fullFilePath = accessFullFilePath( sentinelFileName );
    await RNFS.unlink( fullFilePath );
    console.log( "Deleted sentinel file:", sentinelFileName );
  } catch ( error ) {
    console.error( "Failed to delete sentinel file:", error, sentinelFileName );
  }
};

export {
  createSentinelFile,
  deleteSentinelFile,
  logStage
};
