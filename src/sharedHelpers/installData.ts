import RNFS from "react-native-fs";
import { MMKV } from "react-native-mmkv";
import uuid from "react-native-uuid";

const MMKV_ID = "install-data";
const INSTALL_ID = "installID";

// This store is separate from the zustand store b/c it needs to survive sign
// out, i.e these values should remain untill the app is uninstalled
const store = new MMKV( { id: MMKV_ID } );

// Migrate old MMKV data if it exists. This data is explicitly *not*
// linked to a user
const LEGACY_MMKV_ID = "user-data";
const legacyStore = new MMKV( { id: LEGACY_MMKV_ID } );
if ( legacyStore.getAllKeys().length > 0 ) {
  // Migrate data if present
  legacyStore.getAllKeys().forEach( key => {
    store.set( key, legacyStore.getString( key ) );
  } );
  // Delete the old data on disk so we never have to do this again
  RNFS.readDir( `${RNFS.DocumentDirectoryPath}/mmkv` ).then( contents => {
    contents.forEach( item => {
      if ( item.path.match( new RegExp( `/${LEGACY_MMKV_ID}` ) ) ) {
        RNFS.unlink( item.path );
      }
    } );
  } );
}

// eslint-disable-next-line import/prefer-default-export
export function getInstallID( ) {
  const id = store.getString( INSTALL_ID );
  if ( id ) return id;
  const newID: string = uuid.v4( ).toString( );
  store.set( INSTALL_ID, newID );
  return newID;
}
