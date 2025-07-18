import { t } from "i18next";
import { Alert, Linking } from "react-native";
import RNFS from "react-native-fs";

export const sleep = ( ms: number ) => new Promise( resolve => {
  setTimeout( resolve, ms );
} );

// Unlink file at path. Tries to catch some common exceptions when we try to
// unlink something that was already unlinked
export const unlink = async ( path: string | null ) => {
  if ( !path ) return;
  const pathExists = await RNFS.exists( path );
  if ( !pathExists ) return;
  try {
    await RNFS.unlink( path );
  } catch ( e ) {
    const unlinkError = e as Error;
    if (
      !unlinkError.message.match( /no such file/ )
      && !unlinkError.message.match( /does not exist/ )
    ) throw unlinkError;
    // If we catch the no such file error, that's fine. We just want it gone.
  }
};

export async function openExternalWebBrowser( url: string ) {
  const supported = await Linking.canOpenURL( url );
  if ( supported ) {
    await Linking.openURL( url );
  } else {
    Alert.alert( t( "Sorry-we-dont-know-how-to-open-that-URL", { url } ) );
  }
}
