/*
    This file contains various patches for handling the react-native-vision-camera library.
*/

import { Platform } from "react-native";
import { isTablet } from "react-native-device-info";
import {
  useSharedValue as useWorkletSharedValue,
  Worklets
} from "react-native-worklets-core";
import {
  LANDSCAPE_LEFT,
  LANDSCAPE_RIGHT,
  PORTRAIT_UPSIDE_DOWN
} from "sharedHooks/useDeviceOrientation.ts";

export const rotationValue = deviceOrientation => {
  switch ( deviceOrientation ) {
    case LANDSCAPE_LEFT:
      return -90;
    case LANDSCAPE_RIGHT:
      return 90;
    case PORTRAIT_UPSIDE_DOWN:
      return 180;
    default:
      return 0;
  }
};

// Needed for react-native-vision-camera v3.3.1
// This patch is used to rotate the camera view on iPads.
// The only thing to do there is to rotate the camera view component
// depending on the device orientation. The resulting photo is already rotated in other places.
export const iPadStylePatch = deviceOrientation => {
  // Do nothing on Android
  if ( Platform.OS === "android" ) {
    return {};
  }
  // Do nothing on phones
  if ( !isTablet() ) {
    return {};
  }
  if ( deviceOrientation === LANDSCAPE_RIGHT ) {
    return {
      transform: [{ rotate: "90deg" }]
    };
  } if ( deviceOrientation === LANDSCAPE_LEFT ) {
    return {
      transform: [{ rotate: "-90deg" }]
    };
  } if ( deviceOrientation === PORTRAIT_UPSIDE_DOWN ) {
    return {
      transform: [{ rotate: "180deg" }]
    };
  }
  return {};
};

// This patch is currently required because we are using react-native-vision-camera v4.0.3
// together wit react-native-reanimated. The problem is that the runAsync function
// from react-native-vision-camera does not work in release mode with this reanimated.
// Uses this workaround: https://gist.github.com/nonam4/7a6409cd1273e8ed7466ba3a48dd1ecc but adapted it to
// version 4 of vision-camera.
// Originally, posted on this currently open issue: https://github.com/mrousavy/react-native-vision-camera/issues/2589
export const usePatchedRunAsync = ( ) => {
  /**
   * Print worklets logs/errors on js thread
   */
  const logOnJs = Worklets.createRunOnJS( ( log, error ) => {
    console.log( "logOnJs - ", log, " - error?:", error?.message ?? "no error" );
  } );
  const isAsyncContextBusy = useWorkletSharedValue( false );
  const customRunOnAsyncContext = Worklets.defaultContext.createRunAsync(
    ( frame, func ) => {
      "worklet";

      try {
        func( frame );
      } catch ( e ) {
        logOnJs( "customRunOnAsyncContext error", e );
      } finally {
        frame.decrementRefCount();
        isAsyncContextBusy.value = false;
      }
    }
  );

  function customRunAsync( frame, func ) {
    "worklet";

    if ( isAsyncContextBusy.value ) {
      return;
    }
    isAsyncContextBusy.value = true;
    const internal = frame;
    internal.incrementRefCount();
    customRunOnAsyncContext( internal, func );
  }

  return customRunAsync;
};
