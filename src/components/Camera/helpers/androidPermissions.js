// @flow

import { PermissionsAndroid } from "react-native";

const checkCameraPermissions = async ( ): Promise<any> => {
  const { PERMISSIONS, RESULTS } = PermissionsAndroid;

  try {
    const granted = await PermissionsAndroid.request( PERMISSIONS.CAMERA );
    console.log( granted, "granted camera permissions in helper func" );

    if ( granted === RESULTS.GRANTED ) {
      return true;
    }
    return "permissions";
  } catch ( e ) {
    return e;
  }
};

export default checkCameraPermissions;
