import type { SaveToCameraRollOptions } from "@react-native-camera-roll/camera-roll";
import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import {
  permissionResultFromMultiple,
  READ_WRITE_MEDIA_PERMISSIONS,
  requestWriteMediaPermission,
} from "components/SharedComponents/PermissionGateContainer";
import { t } from "i18next";
import {
  Alert,
} from "react-native";
import { checkMultiple, RESULTS } from "react-native-permissions";
import { log } from "sharedHelpers/logger";

import { displayName as appName } from "../../../../app.json";

const logger = log.extend( "savePhotosToPhotoLibrary" );

type SaveToCameraRollOptionsWithLocation = SaveToCameraRollOptions & {
  latitude?: number;
  longitude?: number;
  horizontalAccuracy?: number;
};

// Save URIs to camera photo library (if a photo was taken using the app,
// we want it accessible in the camera's folder, as if the user has taken those photos
// via their own camera app).
// One could argue this is a private method and shouldn't be exported and
// doesn't need to be tested... but hooks are complicated and this hook might
// be too complicated, so this at least makes it easy to test this one part
// ~~~kueda20240614
async function savePhotosToPhotoLibrary(
  uris: string[],
  location: { latitude: number; longitude: number; positional_accuracy?: number } | null,
) {
  if ( !await requestWriteMediaPermission( ) ) {
    logger.info( "Write media permission not granted, skipping save to photo library" );
    return [];
  }

  const readWritePermissionResult = permissionResultFromMultiple(
    await checkMultiple( READ_WRITE_MEDIA_PERMISSIONS ),
  );
  const savedPhotoUris = await uris.reduce(
    async ( memo, uri ) => {
      const savedUris = await memo;
      try {
        const saveOptions: SaveToCameraRollOptionsWithLocation = {};
        // One quirk of CameraRoll is that if you want to write to an album, you
        // need readwrite permission, but we don't want to ask for that here
        // b/c it might come immediately after asking for *add only*
        // permission, so we're checking to see if we have that permission
        // and skipping the album if we don't
        if ( readWritePermissionResult === RESULTS.GRANTED ) {
          saveOptions.type = "photo";
          // Note: we do not translate our brand name, so this should not be
          // globalized
          saveOptions.album = appName;
        }
        if ( location ) {
          saveOptions.latitude = location.latitude;
          saveOptions.longitude = location.longitude;
          saveOptions.horizontalAccuracy = location.positional_accuracy;
        }
        const savedPhotoUri = await CameraRoll.save( uri, saveOptions );
        savedUris.push( savedPhotoUri );
        return savedUris;
      } catch ( cameraRollSaveError ) {
        // should never get here since in usePrepareStoreAndNavigate we check for device full
        // and skip saving to photo library
        const error = cameraRollSaveError instanceof Error
          ? cameraRollSaveError
          : new Error( String( cameraRollSaveError ) );
        if (
          error.message.match( /No space left on device/ )
          || error.message.match( /PHPhotosErrorDomain error 3305/ )
        ) {
          Alert.alert(
            t( "Not-enough-space-left-on-device" ),
            t( "Not-enough-space-left-on-device-try-again" ),
            [{ text: t( "OK" ) }],
          );
          return savedUris;
        }
        logger.error( `Error saving photo to camera roll: ${cameraRollSaveError}` );
        return savedUris;
      }
    },
    // We need the initial value even if we're not using it, otherwise reduce
    // will treat the first item in the array as the initial value and not
    // call the reducer function on it
    Promise.resolve<string[]>( [] ),
  );
  return savedPhotoUris;
}

export default savePhotosToPhotoLibrary;
