import {
  useMemo, useState,
} from "react";
import { Dimensions } from "react-native";
import DeviceInfo from "react-native-device-info";
import type { OrientationType } from "react-native-orientation-locker";
import {
  useDeviceOrientationChange,
} from "react-native-orientation-locker";

export const LANDSCAPE_LEFT = "landscape-left" as const;
export const LANDSCAPE_RIGHT = "landscape-right" as const;
export const PORTRAIT = "portrait" as const;
export const PORTRAIT_UPSIDE_DOWN = "portrait-upside-down" as const;

const { width, height } = Dimensions.get( "screen" );

export function orientationLockerToIosOrientation( orientation: OrientationType ): string {
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

const useDeviceOrientation = ( ) => {
  const [deviceOrientation, setDeviceOrientation] = useState<string>( );

  useDeviceOrientationChange( ( orientation: OrientationType ) => {
    // FACE-UP and FACE-DOWN could be portrait or landscape, I guess the
    // device can't tell, so I'm just not changing the layout at all for
    // those. ~~~ kueda 20230420
    if ( orientation === "FACE-UP" || orientation === "FACE-DOWN" ) {
      return;
    }
    const newOrientation = orientationLockerToIosOrientation( orientation );
    if ( deviceOrientation === newOrientation ) {
      return;
    }
    setDeviceOrientation( newOrientation );
  } );

  const orientation = useMemo( ( ) => {
    const isLandscapeMode = [LANDSCAPE_LEFT, LANDSCAPE_RIGHT].includes( deviceOrientation );

    const screenWidth = isLandscapeMode
      ? Math.max( width, height )
      : Math.min( width, height );

    const screenHeight = isLandscapeMode
      ? Math.min( width, height )
      : Math.max( width, height );

    return {
      deviceOrientation,
      isTablet: DeviceInfo.isTablet( ),
      isLandscapeMode,
      screenWidth,
      screenHeight,
    };
  }, [deviceOrientation] );

  return orientation;
};

export default useDeviceOrientation;
