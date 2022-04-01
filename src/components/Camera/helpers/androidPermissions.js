// @flow

import { PermissionsAndroid } from "react-native";


const requestCameraPermission = async ( ): Promise<string> => {
  try {
    const granted = await PermissionsAndroid.request( PermissionsAndroid.PERMISSIONS.CAMERA );
    if ( granted === PermissionsAndroid.RESULTS.GRANTED ) {
      console.log( granted, "permission requested and granted" );
      return "granted";
    } else {
      return "denied";
    }
  } catch ( err ) {
    return "not-determined";
  }
};

export default requestCameraPermission;
