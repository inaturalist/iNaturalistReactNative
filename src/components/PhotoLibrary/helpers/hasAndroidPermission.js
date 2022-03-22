// @flow

import { PermissionsAndroid } from "react-native";

const hasAndroidPermission = async ( ): Promise<boolean> => {
  const retrieve = PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;

  try {
    const granted = await PermissionsAndroid.request( retrieve );
    if ( granted === PermissionsAndroid.RESULTS.GRANTED ) {
      return true;
    }
    return false;
  } catch ( err ) {
    return err;
  }
};

export default hasAndroidPermission;
