import { MMKV } from "react-native-mmkv";
import uuid from "react-native-uuid";

const INSTALL_ID = "installID";

const userData = new MMKV( {
  id: "user-data"
} );
export default userData;

export function installID( ) {
  const id = userData.getString( INSTALL_ID );
  if ( id ) return id;
  const newID = uuid.v4( );
  userData.set( INSTALL_ID, newID );
  return newID;
}
