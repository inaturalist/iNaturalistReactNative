import RNFS from "react-native-fs";
import { MMKV, useMMKVBoolean } from "react-native-mmkv";
import * as uuid from "uuid";

const MMKV_ID = "install-data";
const INSTALL_ID = "installID";
const ONBOARDING_SHOWN = "onboardingShown";
export const IS_FRESH_INSTALL = "isFreshInstall";

// This store is separate from the zustand store b/c it needs to survive sign
// out, i.e these values should remain untill the app is uninstalled
export const store = new MMKV( { id: MMKV_ID } );

// Migrate old MMKV data if it exists. This data is explicitly *not*
// linked to a user
const LEGACY_MMKV_ID = "user-data";
let legacyStore;
if ( legacyStore.getAllKeys().length > 0 ) {
  // Migrate data if present
  legacyStore.getAllKeys().forEach( key => {
    store.set( key, legacyStore.getString( key ) );
  } );
  // Delete the old data on disk so we never have to do this again
  RNFS.readDir( `${RNFS.DocumentDirectoryPath}/mmkv` ).then( contents => {
    const hasLegacyFiles = contents.forEach( item => {
      if ( item.path.match( new RegExp( `/${LEGACY_MMKV_ID}` ) ) ) {
        RNFS.unlink( item.path );
      }
    } );

    if ( hasLegacyFiles ) {
      legacyStore = new MMKV( { id: LEGACY_MMKV_ID } );
    }
  } );
}

export function getInstallID( ) {
  const id = store.getString( INSTALL_ID );
  if ( id ) return id;
  const newID: string = uuid.v4( ).toString( );
  store.set( INSTALL_ID, newID );
  store.set( IS_FRESH_INSTALL, true );
  return newID;
}

// Hook to see if this *installation* has seen the onboarding. If the user
// signs out, we don't want them to see the onboarding again. This only gets
// used in a component, so no need to expose any other getters/setters
export function useOnboardingShown() {
  return useMMKVBoolean( ONBOARDING_SHOWN, store );
}
