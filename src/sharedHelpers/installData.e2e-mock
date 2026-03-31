import { MMKV, useMMKVBoolean } from "react-native-mmkv";
import * as uuid from "uuid";

const MMKV_ID = "install-data";
const INSTALL_ID = "installID";
const ONBOARDING_SHOWN = "onboardingShown";
export const IS_FRESH_INSTALL = "isFreshInstall";

export const store = new MMKV( { id: MMKV_ID } );

export function getInstallID( ) {
  const id = store.getString( INSTALL_ID );
  if ( id ) return id;
  const newID: string = uuid.v4( ).toString( );
  store.set( INSTALL_ID, newID );
  // Skip setting IS_FRESH_INSTALL in e2e to avoid triggering
  // RNRestart.restart() which kills the Detox instrumentation process
  return newID;
}

export function useOnboardingShown() {
  return useMMKVBoolean( ONBOARDING_SHOWN, store );
}
