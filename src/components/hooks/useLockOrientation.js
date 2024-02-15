// @flow

import { useEffect } from "react";
import DeviceInfo from "react-native-device-info";
import Orientation from "react-native-orientation-locker";

const isTablet = DeviceInfo.isTablet();

const useLockOrientation = ( ) => {
  useEffect( () => {
    if ( !isTablet ) {
      Orientation.lockToPortrait();
    }

    return ( ) => Orientation?.unlockAllOrientations( );
  }, [] );
};

export default useLockOrientation;
