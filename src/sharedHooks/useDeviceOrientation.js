// @flow
import {
  useCallback, useEffect, useState
} from "react";
import { Dimensions } from "react-native";
import DeviceInfo from "react-native-device-info";
import Orientation from "react-native-orientation-locker";

export const LANDSCAPE_LEFT = "landscape-left";
export const LANDSCAPE_RIGHT = "landscape-right";
export const PORTRAIT = "portrait";
export const PORTRAIT_UPSIDE_DOWN = "portrait-upside-down";

export function orientationLockerToIosOrientation( orientation: string ): string {
  // react-native-orientation-locker and react-native-vision-camera  different
  // string values for these constants, so we map everything to the
  // react-native-vision-camera versions
  switch ( orientation ) {
    case "LANDSCAPE-RIGHT":
      return LANDSCAPE_RIGHT;
    case "LANDSCAPE-LEFT":
      return LANDSCAPE_LEFT;
    case "PORTRAIT-UPSIDEDOWN":
      return PORTRAIT_UPSIDE_DOWN;
    default:
      return PORTRAIT;
  }
}

const useDeviceOrientation = ( ): Object => {
  const { width, height } = Dimensions.get( "screen" );
  const [screenWidth, setScreenWidth] = useState( width );
  const [screenHeight, setScreenHeight] = useState( height );

  const [deviceOrientation, setDeviceOrientation] = useState( );

  useEffect( ( ) => {
    // Word of caution: getInitialOrientation gets the orientation when JS
    // started, so it's almost always PORTRAIT; getOrientation gets the
    // orientation the app thinks it's in, which should be PORTRAIT on
    // phones; getDeviceOrientation gets the actual current orientation of
    // the device, which is what we want here for the initial value
    Orientation.getDeviceOrientation( newOrientation => {
      setDeviceOrientation( orientationLockerToIosOrientation( newOrientation ) );
    } );
  }, [] );

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
      setDeviceOrientation( orientationLockerToIosOrientation( orientation ) );
    },
    [setDeviceOrientation]
  );

  useEffect( () => {
    Orientation.addDeviceOrientationListener( onDeviceRotation );

    return () => {
      Orientation?.removeOrientationListener( onDeviceRotation );
    };
  } );

  useEffect( ( ) => {
    // it doesn't seem like Dimensions changes the width immediately on device rotation
    // so doing this manually
    if ( isLandscapeMode ) {
      setScreenWidth( Math.max( width, height ) );
      setScreenHeight( Math.min( width, height ) );
    } else {
      setScreenWidth( Math.min( width, height ) );
      setScreenHeight( Math.max( width, height ) );
    }
  }, [isLandscapeMode, width, height] );

  return {
    deviceOrientation,
    isTablet,
    isLandscapeMode,
    screenWidth,
    screenHeight
  };
};

export default useDeviceOrientation;
