import {
  appendFile,
  exists,
  readDir,
  readFile,
  TemporaryDirectoryPath,
  writeFile,
} from "@dr.pogodin/react-native-fs";
import { t } from "i18next";
import { useEffect, useState } from "react";
import { Alert, Platform, Share } from "react-native";
import {
  getBuildNumber,
  getSystemName,
  getVersion,
} from "react-native-device-info";
import Mailer from "react-native-mail";
import { unlink } from "sharedHelpers/util";

import {
  legacyLogfilePath,
  logFileDirectory,
  logFileNamePrefix,
} from "../../../react-native-logs.config";

const getSortedDailyLogFileInfo = async ( n?: number ) => {
  const dir = await readDir( logFileDirectory );
  const sortedLogFiles = dir
    .filter( ( { name } ) => name.startsWith( logFileNamePrefix ) )
    .map( ( { name, size, path } ) => {
      // assumes log files will be prefix.yyyy-mm-dd.txt
      const dateString = name.split( "." )[1];
      const date = Date.parse( dateString );
      if ( isNaN( date ) ) {
        // just log to console, this would only happen if a file is intentionally stuffed in here
        console.warn( `Unable to parse date from rolling logfile: ${path}` );
        return null;
      }
      // RN-logs doesn't zero-pad months/days, so we have to parse date in order to sort
      return {
        name,
        path,
        size,
        date,
      };
    } )
    .filter( a => !!a )
    // flipped for descending
    .sort( ( a, b ) => b.date - a.date );

  return n === undefined
    ? sortedLogFiles
    : sortedLogFiles.slice( 0, n );
};

export async function cleanupLogFiles() {
  if ( await exists( legacyLogfilePath ) ) {
    await unlink( legacyLogfilePath );
  }

  const logFileInfo = await getSortedDailyLogFileInfo();
  const olderLogs = logFileInfo.slice( 40 );
  await Promise.allSettled( olderLogs.map( ( { path } ) => unlink( path ) ) );
}

export async function deleteLegacyLogFile() {
  try {
    await unlink( legacyLogfilePath );
  } catch ( deleteFileError ) {
    if ( deleteFileError instanceof Error && deleteFileError.message.match( /no such file/ ) ) {
      return;
    }
    throw deleteFileError;
  }
}

const appVersion = getVersion();
const buildVersion = getBuildNumber();
const device = getSystemName();
const emailParams = {
  subject: `iNat RN ${device} Logs (version ${appVersion} - ${buildVersion})`,
  recipients: ["help+mobile@inaturalist.org"],
};

async function shareLogFile( path:string ) {
  return Share.share(
    {
      title: emailParams.subject,
      url: path,
    },
    emailParams,
  );
}

async function emailLogFile( path: string ) {
  Mailer.mail(
    {
      ...emailParams,
      isHTML: true,
      attachments: [
        {
          path,
          mimeType: "txt",
        },
      ],
    },
    ( error, event ) => {
      if ( Platform.OS === "ios" && error === "not_available" ) {
        Alert.alert(
          t( "No-email-app-installed" ),
          t( "You-can-still-share-the-file", {
            email: emailParams.recipients[0],
          } ),
          [
            {
              text: t( "Cancel" ),
              style: "cancel",
            },
            {
              text: t( "Share" ),
              onPress: () => shareLogFile( path ),
            },
          ],
        );
        return;
      }
      Alert.alert( error, event );
    },
  );
}

export async function getLegacyLogfileExists() {
  return exists( legacyLogfilePath );
}

export const temporaryLogForSharingPath
= `${TemporaryDirectoryPath}/${logFileNamePrefix}-recent.txt`;

const concatenateLogsForSharing = async () => {
  // this will overwrite / clear an existing temp one if it exists
  await writeFile( temporaryLogForSharingPath, "" );

  const mostRecentLogs = ( await getSortedDailyLogFileInfo( 20 ) )
    // we want to start with the oldest and _add_ newer ones as we go
    .reverse();

  for ( const { path } of mostRecentLogs ) {
    // eslint-disable-next-line no-await-in-loop
    const chunkContents = await readFile( path );
    // eslint-disable-next-line no-await-in-loop
    await appendFile( temporaryLogForSharingPath, chunkContents );
  }
};

export async function shareRecentLogs( ) {
  await concatenateLogsForSharing();
  return shareLogFile( temporaryLogForSharingPath );
}

export async function emailRecentLogs( ) {
  await concatenateLogsForSharing();
  return emailLogFile( temporaryLogForSharingPath );
}

interface LogPreview {
  text: string;
  length: number;
}

async function getRecentLogContentPreview() {
  // we don't need to be precise here, we can jam 10 together and limit it later
  const recentLogsPaths = ( await getSortedDailyLogFileInfo( 10 ) )
    .map( ( { path } ) => path )
    // we want to start with the oldest and _add_ newer ones as we go
    .reverse();

  let aggregatedContents = "";
  for ( const logPath of recentLogsPaths ) {
    // intentionally making file reads serial
    // eslint-disable-next-line no-await-in-loop
    const contents = await readFile( logPath );
    aggregatedContents += contents;
  }
  return aggregatedContents;
}

export function useLogPreview( ): LogPreview | null {
  const [logPreview, setLogPreview] = useState<LogPreview | null>( null );

  useEffect( ( ) => {
    const getLogPreview = async () => {
      const logContents = await getRecentLogContentPreview();

      const lines = logContents.split( "\n" );
      const trimmedContent = lines
        .slice( lines.length - 1000, lines.length )
        .join( "\n" );
      setLogPreview( { text: trimmedContent, length: lines.length } );
    };

    getLogPreview();
  }, [] );

  return logPreview;
}
