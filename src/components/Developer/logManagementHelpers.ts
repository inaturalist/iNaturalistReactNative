import { t } from "i18next";
import { Alert, Platform, Share } from "react-native";
import {
  getBuildNumber,
  getSystemName,
  getVersion,
} from "react-native-device-info";
import RNFS from "react-native-fs";
import Mailer from "react-native-mail";

import { legacyLogfilePath } from "../../../react-native-logs.config";

export async function getLegacyLogContents() {
  try {
    const contents = await RNFS.readFile( legacyLogfilePath );
    return contents.split( "\n" ).join( "\n" );
  } catch ( readFileError ) {
    if ( readFileError instanceof Error && readFileError.message.match( /no such file/ ) ) {
      return "";
    }
    throw readFileError;
  }
}

export async function deleteLegacyLogFile() {
  try {
    await RNFS.unlink( legacyLogfilePath );
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
  return RNFS.exists( legacyLogfilePath );
}

export async function shareLegacyLogFile( ) {
  return shareLogFile( legacyLogfilePath );
}

export async function emailLegacyLogFile( ) {
  return emailLogFile( legacyLogfilePath );
}
