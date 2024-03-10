// Hook for reading log content and sharing it. Use react-native-logs.config
// for writing logs

import { t } from "i18next";
import {
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";
import { Alert, Platform, Share } from "react-native";
import {
  getBuildNumber,
  getSystemName,
  getVersion
} from "react-native-device-info";
import RNFS from "react-native-fs";
import Mailer from "react-native-mail";

import { logFilePath } from "../../react-native-logs.config";

const useLogs = ( ) => {
  const appVersion = getVersion();
  const buildVersion = getBuildNumber();
  const device = getSystemName();
  const emailParams = useMemo( ( ) => ( {
    subject: `iNat RN ${device} Logs (version ${appVersion} - ${buildVersion})`,
    recipients: ["help+mobile@inaturalist.org"]
  } ), [device, appVersion, buildVersion] );
  const [logContents, setLogContents] = useState( "" );
  const [logFileMtime, setLogFileMtime] = useState( null );

  useEffect( ( ) => {
    async function getLogfileStat( ) {
      const { mtime } = await RNFS.stat( logFilePath );
      setLogFileMtime( mtime );
    }
    getLogfileStat( );
  }, [] );

  useEffect( () => {
    async function fetchLogContents() {
      try {
        const contents = await RNFS.readFile( logFilePath );
        setLogContents( contents.split( "\n" ).join( "\n" ) );
      } catch ( readFileError ) {
        if ( readFileError.message.match( /no such file/ ) ) {
          setLogContents( "" );
        } else {
          throw readFileError;
        }
      }
    }
    fetchLogContents();
  }, [logFileMtime] );

  const shareLogFile = useCallback( ( ) => Share.share(
    {
      title: emailParams.subject,
      url: logFilePath
    },
    emailParams
  ), [emailParams] );

  const emailLogFile = useCallback( ( ) => Mailer.mail(
    {
      ...emailParams,
      isHTML: true,
      attachments: [
        {
          path: logFilePath,
          mimeType: "txt"
        }
      ]
    },
    ( error, event ) => {
      if ( Platform.OS === "ios" && error === "not_available" ) {
        Alert.alert(
          t( "Looks-like-youre-not-using-Apple-Mail" ),
          t( "You-can-still-share-the-file", {
            email: emailParams.recipients[0]
          } ),
          [
            {
              text: t( "Cancel" ),
              style: "cancel"
            },
            {
              text: t( "Share" ),
              onPress: () => shareLogFile( emailParams )
            }
          ]
        );
        return;
      }
      Alert.alert( error, event );
    }
  ), [
    emailParams,
    shareLogFile
  ] );

  return {
    shareLogFile,
    emailLogFile,
    logContents
  };
};

export default useLogs;
