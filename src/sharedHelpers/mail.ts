import { t } from "i18next";
import { Alert, Platform } from "react-native";
import { openInbox as RNOpenInbox } from "react-native-email-link";
import Mailer from "react-native-mail";

export async function openInbox() {
  try {
    await RNOpenInbox( {
      removeText: true,
    } );
  } catch ( error ) {
    Alert.alert( t( "Something-went-wrong" ), ( error as Error ).message );
  }
}

export function composeEmail( emailAddress: string ) {
  Mailer.mail( {
    recipients: [emailAddress],
  }, ( error: string ) => {
    if ( Platform.OS === "ios" && error === "not_available" ) {
      Alert.alert(
        t( "No-email-app-installed" ),
        t( "No-email-app-installed-body", { address: emailAddress } ),
      );
      return;
    }
    if ( error ) {
      Alert.alert( t( "Something-went-wrong" ), error );
    }
  } );
}
