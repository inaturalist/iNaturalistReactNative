import { PermissionsAndroid } from "react-native";
import { request, RESULTS } from "react-native-permissions";

export const PERMISSION_GRANTED = "granted";
export const PERMISSION_DENIED = "denied";
export const PERMISSION_NEVER_ASK_AGAIN = "never_ask_again";

export const requestPermission = async permission => {
  if ( !permission ) return PERMISSION_GRANTED;

  if ( !permission.includes( "android" ) ) {
    const response = await request( permission );
    if ( response === RESULTS.GRANTED ) {
      return PERMISSION_GRANTED;
    } if ( response === RESULTS.DENIED ) {
      return PERMISSION_DENIED;
    }
    return PERMISSION_NEVER_ASK_AGAIN;
  }

  const response = await PermissionsAndroid.request( permission );
  if ( response === PermissionsAndroid.RESULTS.GRANTED ) {
    return PERMISSION_GRANTED;
  } if ( response === PermissionsAndroid.RESULTS.DENIED ) {
    return PERMISSION_DENIED;
  }
  return PERMISSION_NEVER_ASK_AGAIN;
};

export const requestMultiplePermissions = async permissions => {
  // Request for all permissions, one by one
  for ( let i = 0; i < permissions.length; i += 1 ) {
    // eslint-disable-next-line no-await-in-loop
    const result = await requestPermission( permissions[i] );
    if ( result !== PERMISSION_GRANTED ) {
      return result;
    }
  }

  return PERMISSION_GRANTED;
};
