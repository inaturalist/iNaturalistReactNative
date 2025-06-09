/*
    This file contains various patches for handling the react-native-vision-camera library.
*/

import {
  rotatedOriginalPhotosPath
} from "appConstants/paths.ts";
import { Platform } from "react-native";
import { isTablet } from "react-native-device-info";
import RNFS from "react-native-fs";
import {
  useSharedValue as useWorkletSharedValue,
  Worklets
} from "react-native-worklets-core";
import resizeImage from "sharedHelpers/resizeImage.ts";
import { unlink } from "sharedHelpers/util.ts";
import {
  LANDSCAPE_LEFT,
  LANDSCAPE_RIGHT,
  PORTRAIT,
  PORTRAIT_UPSIDE_DOWN
} from "sharedHooks/useDeviceOrientation.ts";

// Needed for react-native-vision-camera v3.9.0
// As of this version the photo from takePhoto is not oriented coming from the native side.
// E.g. if you take a photo in landscape-right and save it to camera roll directly from the
// vision camera, it will be tilted in the native photo app. So, on iOS, depending on the
// metadata of the photo the rotation needs to be set to 0 or 180.
// On Android, the rotation is derived from the device orientation at the time of taking the
// photo, because orientation is not yet supported in the library.
export const rotationTempPhotoPatch = ( photo, deviceOrientation ) => {
  let photoRotation = 0;
  if ( Platform.OS === "ios" ) {
    switch ( photo.metadata?.Orientation ) {
      case 1:
      case 3:
        photoRotation = 180;
        break;
      case 6:
      case 8:
        photoRotation = 0;
        break;
      default:
        photoRotation = 0;
    }
  } else {
    switch ( deviceOrientation ) {
      case PORTRAIT:
        photoRotation = 90;
        break;
      case LANDSCAPE_RIGHT:
        photoRotation = 180;
        break;
      case LANDSCAPE_LEFT:
        photoRotation = 0;
        break;
      case PORTRAIT_UPSIDE_DOWN:
        photoRotation = 270;
        break;
      default:
        photoRotation = 90;
    }
  }
  return photoRotation;
};

// Needed for react-native-vision-camera v3.9.0
// This patch is used to rotate the photo taken with the vision camera.
// Because the photos coming from the vision camera are not oriented correctly, we
// rotate them with image-resizer as a first step, replacing the original photo.
export const rotatePhotoPatch = async ( photo, deviceOrientation ) => {
  const rotation = rotationTempPhotoPatch( photo, deviceOrientation );
  const path = rotatedOriginalPhotosPath;
  await RNFS.mkdir( path );
  // Rotate the image with ImageResizer
  const image = await resizeImage(
    photo.path,
    {
      width: photo.width,
      height: photo.height,
      rotation,
      outputPath: path
    }
  );
  // Remove original photo
  await unlink( photo.path );
  return image;
};

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
