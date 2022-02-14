// @flow

import { useEffect, useState } from "react";
import { PermissionsAndroid, Platform } from "react-native";

const useAndroidPermission = ( ): ?boolean => {
  const [granted, setGranted] = useState( null );

  useEffect( ( ) => {
    let isCurrent = true;

    const hasAndroidPermission = async ( ) => {
      const permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;

      const hasPermission = await PermissionsAndroid.check( permission );
      if ( hasPermission ) {
        return true;
      }

      const status = await PermissionsAndroid.request( permission );
      if ( !isCurrent ) { return; }
      setGranted( status === "granted" );
    };

    if ( Platform.OS === "android" ) {
      hasAndroidPermission( );
    }

    return ( ) => {
      isCurrent = false;
    };
  }, [] );

  return granted;
};

export default useAndroidPermission;


