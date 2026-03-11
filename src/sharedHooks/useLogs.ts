import { t } from "i18next";
import { Alert, Platform, Share } from "react-native";
import {
  getBuildNumber,
  getSystemName,
  getVersion,
} from "react-native-device-info";
import RNFS from "react-native-fs";
import Mailer from "react-native-mail";

import { logFilePath } from "../../react-native-logs.config";

export async function getLogContents() {
  try {
    const contents = await RNFS.readFile( logFilePath );
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
    await RNFS.unlink( logFilePath );
  } catch ( readFileError ) {
    if ( readFileError instanceof Error && readFileError.message.match( /no such file/ ) ) {
      return;
    }
    throw readFileError;
  }
}

const appVersion = getVersion();
const buildVersion = getBuildNumber();
const device = getSystemName();
const emailParams = {
  subject: `iNat RN ${device} Logs (version ${appVersion} - ${buildVersion})`,
  recipients: ["help+mobile@inaturalist.org"],
};

export async function shareLogFile() {
  Share.share(
    {
      title: emailParams.subject,
      url: logFilePath,
    },
    emailParams,
  );
}

export async function emailLogFile( ) {
  Mailer.mail(
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
}
