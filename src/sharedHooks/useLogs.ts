// Hook for reading log content and sharing it. Use react-native-logs.config
// for writing logs

import { useFocusEffect } from "@react-navigation/native";
import { t } from "i18next";
import {
  useCallback,
  useState,
} from "react";
import { Alert, Platform, Share } from "react-native";
import {
  getBuildNumber,
  getSystemName,
  getVersion,
} from "react-native-device-info";
import RNFS from "react-native-fs";
import Mailer from "react-native-mail";

import { logFileDirectory, logFileNamePrefix, logFilePath } from "../../react-native-logs.config";

const getSortedLogFiles = async ( n: number ) => {
  const dir = await RNFS.readDir( logFileDirectory );
  const sortedLogFiles = dir
    .filter( ( { name } ) => name.startsWith( logFileNamePrefix ) )
    .map( ( { name, path } ) => {
      // assumes log files will be prefix.yyyy-mm-dd.txt
      const dateString = name.split( "." )[1];
      // RN-logs doesn't zero-pad months/days, so we have to parse date in order to sort
      return {
        name,
        path,
        date: Date.parse( dateString ),
      };
    } )
    // flipped for descending
    .sort( ( a, b ) => b.date - a.date );
  return n
    ? sortedLogFiles.slice( 0, n )
    : sortedLogFiles;
};

export const temporaryLogForSharingPath
= `${RNFS.TemporaryDirectoryPath}/${logFileNamePrefix}-recent.txt`;

const concatenateLogsForSharing = async () => {
  await RNFS.writeFile( temporaryLogForSharingPath, "" );

  const mostRecentLogs = await getSortedLogFiles( 10 );

  for ( const { path } of mostRecentLogs ) {
    // eslint-disable-next-line no-await-in-loop
    const chunkContents = await RNFS.readFile( path );
    // eslint-disable-next-line no-await-in-loop
    await RNFS.appendFile( temporaryLogForSharingPath, chunkContents );
  }
};

const deleteTemporarySharingLog = async () => {
  if ( await RNFS.exists( temporaryLogForSharingPath ) ) {
    await RNFS.unlink( temporaryLogForSharingPath );
  }
};

export async function getLogContents() {
  try {
    const [latestLogFile] = await getSortedLogFiles( 1 );

    const contents = await RNFS.readFile( latestLogFile.path );
    return contents.split( "\n" ).join( "\n" );
  } catch ( readFileError ) {
    if ( readFileError instanceof Error && readFileError.message.match( /no such file/ ) ) {
      return "";
    }
    throw readFileError;
  }
}

export async function deleteLogFile() {
  try {
    await RNFS.unlink( logFileDirectory );
    await RNFS.mkdir( logFileDirectory );
  } catch ( readFileError ) {
    if ( readFileError instanceof Error && readFileError.message.match( /no such file/ ) ) {
      return;
    }
    throw readFileError;
  }
}

const useLogs = ( ) => {
  const appVersion = getVersion();
  const buildVersion = getBuildNumber();
  const device = getSystemName();
  const emailParams = {
    subject: `iNat RN ${device} Logs (version ${appVersion} - ${buildVersion})`,
    recipients: ["help+mobile@inaturalist.org"],
  };

  const [logsReadyForSharing, setLogsReadyForSharing] = useState( false );

  useFocusEffect(
    useCallback(
      // eslint-disable-next-line arrow-body-style
      () => {
        // onBlur, clear this prepared log so we don't share stale logs
        return () => {
          setLogsReadyForSharing( false );
          deleteTemporarySharingLog();
        };
      },
      [],
    ),
  );

  const prepareLogForSharing = async () => {
    await concatenateLogsForSharing();
    setLogsReadyForSharing( true );
  };

  const shareLogFile = ( ) => Share.share(
    {
      title: emailParams.subject,
      url: logFilePath,
    },
    emailParams,
  );

  const emailLogFile = ( ) => Mailer.mail(
    {
      ...emailParams,
      isHTML: true,
      attachments: [
        {
          path: logFilePath,
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
              onPress: () => shareLogFile( ),
            },
          ],
        );
        return;
      }
      Alert.alert( error, event );
    },
  );

  return {
    shareLogFile,
    emailLogFile,
    prepareLogForSharing,
    logsReadyForSharing,
  };
};

export default useLogs;
