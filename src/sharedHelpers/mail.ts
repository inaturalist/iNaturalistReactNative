import { t } from "i18next";
import {
  Alert, Linking, NativeModules, Platform
} from "react-native";
import Mailer from "react-native-mail";

const { EmailIntentModule } = NativeModules;

function openInboxError() {
  Alert.alert( t( "No-email-app-installed" ), t( "No-email-app-installed-body-check-other" ) );
}

export async function openInbox() {
  try {
    if ( Platform.OS === "android" ) {
      EmailIntentModule.openEmailClient();
    } else {
      const supported = await Linking.canOpenURL( "message:0" );
      if ( supported ) {
        try {
          await Linking.openURL( "message:0" );
        } catch ( openURLError ) {
          Alert.alert( t( "Something-went-wrong" ), openURLError.message );
        }
      } else {
        openInboxError();
      }
    }
  } catch ( _error ) {
    openInboxError();
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
