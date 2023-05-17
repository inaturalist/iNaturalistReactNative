// @flow
import {
  useCallback, useEffect, useState
} from "react";
import { Dimensions } from "react-native";
import DeviceInfo from "react-native-device-info";
import Orientation from "react-native-orientation-locker";

export const PORTRAIT = "portrait";
export const LANDSCAPE_LEFT = "landscapeLeft";
export const LANDSCAPE_RIGHT = "landscapeRight";

const useDeviceOrientation = ( ): Object => {
  const { width, height } = Dimensions.get( "screen" );
  const [screenWidth, setScreenWidth] = useState( width );
  function orientationLocker( orientation ) {
    switch ( orientation ) {
      case "LANDSCAPE-RIGHT":
        return LANDSCAPE_RIGHT;
      case "LANDSCAPE-LEFT":
        return LANDSCAPE_LEFT;
      default:
        return PORTRAIT;
    }
  }

  const [deviceOrientation, setDeviceOrientation] = useState(
    orientationLocker( Orientation.getInitialOrientation( ) )
  );

  const isLandscapeMode = [LANDSCAPE_LEFT, LANDSCAPE_RIGHT].includes( deviceOrientation );
  const isTablet = DeviceInfo.isTablet();
  // detect device rotation instead of using screen orientation change
  const onDeviceRotation = useCallback(
    orientation => {
    // FACE-UP and FACE-DOWN could be portrait or landscape, I guess the
    // device can't tell, so I'm just not changing the layout at all for
    // those. ~~~ kueda 20230420
      if ( orientation === "FACE-UP" || orientation === "FACE-DOWN" ) {
        return;
      }
      setDeviceOrientation( orientationLocker( orientation ) );
    },
    [setDeviceOrientation]
  );

  useEffect( () => {
    Orientation.addDeviceOrientationListener( onDeviceRotation );

    return () => {
      Orientation.removeOrientationListener( onDeviceRotation );
    };
  } );

  useEffect( ( ) => {
    // it doesn't seem like Dimensions changes the width immediately on device rotation
    // so doing this manually
    if ( isLandscapeMode ) {
      setScreenWidth( Math.max( width, height ) );
    } else {
      setScreenWidth( Math.min( width, height ) );
    }
  }, [isLandscapeMode, width, height] );

  return {
    isTablet,
    isLandscapeMode,
    screenWidth
  };
};

export default useDeviceOrientation;
