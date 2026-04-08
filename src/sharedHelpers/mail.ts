import { t } from "i18next";
import { Alert } from "react-native";
import {
  openComposer,
  openInbox as RNOpenInbox,
} from "react-native-email-link";

export async function openInbox() {
  try {
    await RNOpenInbox( {
      removeText: true,
    } );
  } catch ( error ) {
    if ( ( error as Error ).message === "!isSupported" ) {
      Alert.alert(
        t( "No-email-app-installed" ),
        t( "No-email-app-installed-body-check-other" ),
      );
    } else {
      Alert.alert(
        t( "Something-went-wrong" ),
        ( error as Error ).message,
      );
    }
  }
}

export async function composeEmail( emailAddress: string ) {
  try {
    await openComposer( {
      removeText: true,
      to: emailAddress,
    } );
  } catch ( error ) {
    if ( ( error as Error ).message === "not_available" ) {
      Alert.alert(
        t( "No-email-app-installed" ),
        t( "No-email-app-installed-body", { address: emailAddress } ),
      );
    } else {
      Alert.alert(
        t( "Something-went-wrong" ),
        ( error as Error ).message,
      );
    }
  }
}
