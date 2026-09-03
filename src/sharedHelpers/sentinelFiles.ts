import {
  exists, mkdir, readDir, readFile, writeFile,
} from "@dr.pogodin/react-native-fs";
import { log } from "sharedHelpers/logger";
import { unlink } from "sharedHelpers/util";

import { sentinelFilePath } from "../appConstants/paths";

const logger = log.extend( "sentinelFiles" );

// a sentinel with this stage is considered "clean" and not in need of reporting
const FLOW_COMPLETE_STAGE = "flow_complete";

const accessFullFilePath = ( fileName: string ) => `${sentinelFilePath}/${fileName}`;

const generateSentinelFileName = ( screenName: string ): string => {
  const timestamp = new Date().getTime();
  return `sentinel_${screenName}_${timestamp}.log`;
};

const createSentinelFile = async ( screenName: string ): Promise<string> => {
  try {
    await mkdir( sentinelFilePath );
    const sentinelFileName = generateSentinelFileName( screenName );

    const logEntry = {
      screenName,
      entryTimestamp: new Date( ).toISOString( ),
      stages: [],
    };

    const initialContent = JSON.stringify( logEntry );

    await writeFile( accessFullFilePath( sentinelFileName ), initialContent, "utf8" );
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
    const existingContent = await readFile( fullFilePath, "utf8" );
    const sentinelData = JSON.parse( existingContent );

    const stage = {
      name: stageName,
      timestamp: new Date( ).toISOString( ),
    };

    sentinelData.stages.push( stage );

    await writeFile( fullFilePath, JSON.stringify( sentinelData ), "utf8" );
  } catch ( error ) {
    console.log( error, sentinelFileName, stageName, "Failed to log stage to sentinel file" );
    console.error( "Failed to log stage to sentinel file:", error, sentinelFileName, stageName );
  }
};

// marks flow as complete / non-problematic. sentinel flow writes are fire-and-forget
// by design so that we don't hang during the critical path. We might have in-flight
// flow writes at the time of "success" so instead of deleting the sentinel file, mark
// as complete and let startup handle cleanup
const completeSentinelFile = ( sentinelFileName: string ): Promise<void> => logStage(
  sentinelFileName,
  FLOW_COMPLETE_STAGE,
);

const logSentinelFiles = async ( ) => {
  const directoryExists = await exists( sentinelFilePath );
  if ( !directoryExists ) { return; }
  const files = await readDir( sentinelFilePath );

  files.forEach( async file => {
    try {
      const existingContent = await readFile( file.path, "utf8" );
      const sentinelData = JSON.parse( existingContent );
      const stages = sentinelData.stages || [];
      const completedNormally = stages
        .some( stage => stage.name === FLOW_COMPLETE_STAGE );
      if ( stages.length > 0 && !completedNormally ) {
        logger.error( "Camera flow error: ", existingContent );
      }
    } catch ( error ) {
      logger.error( "Failed to process sentinel file:", error, file.path );
    } finally {
      await unlink( file.path );
    }
  } );
};

export {
  completeSentinelFile,
  createSentinelFile,
  logSentinelFiles,
  logStage,
};
