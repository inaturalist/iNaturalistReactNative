import { t } from "i18next";
import { Alert, Linking, Platform } from "react-native";
import Mailer from "react-native-mail";

function openInboxError() {
  Alert.alert( t( "No-email-app-installed" ), t( "No-email-app-installed-body-check-other" ) );
}

export async function openInbox() {
  let isSupported;
  try {
    isSupported = await Linking.canOpenURL( "message:0" );
  } catch ( _canOpenURLError ) {
    openInboxError();
    return;
  }
  if ( !isSupported ) openInboxError();
  try {
    await Linking.openURL( "message:0" );
  } catch ( openURLError ) {
    Alert.alert( t( "Something-went-wrong" ), openURLError.message );
  }
}

export function composeEmail( emailAddress: string ) {
  Mailer.mail( {
    recipients: [emailAddress]
  }, ( error: string ) => {
    if ( Platform.OS === "ios" && error === "not_available" ) {
      Alert.alert(
        t( "No-email-app-installed" ),
        t( "No-email-app-installed-body", { address: emailAddress } )
      );
      return;
    }
    if ( error ) {
      Alert.alert( t( "Something-went-wrong" ), error );
    }
  } );
}
