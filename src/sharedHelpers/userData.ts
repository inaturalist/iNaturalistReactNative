import { MMKV } from "react-native-mmkv";
import uuid from "react-native-uuid";

const INSTALL_ID = "installID";

// 20240729 amanda - we're keeping this MMKV instance separate from the
// one wrapping zustand because we want to be able to persist the installation ID
// even if a user logs out of the app. this means on signout, we're clearing
// the storage for the MMKV instance wrapping zustand but leaving this one untouched
const userData = new MMKV( {
  id: "user-data"
} );
export default userData;

export function installID( ) {
  const id = userData.getString( INSTALL_ID );
  if ( id ) return id;
  const newID: string = uuid.v4( ).toString( );
  userData.set( INSTALL_ID, newID );
  return newID;
}
