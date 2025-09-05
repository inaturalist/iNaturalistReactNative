import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import {
  permissionResultFromMultiple,
  READ_WRITE_MEDIA_PERMISSIONS
} from "components/SharedComponents/PermissionGateContainer";
import { t } from "i18next";
import {
  Alert
} from "react-native";
import { checkMultiple, RESULTS } from "react-native-permissions";
import { log } from "sharedHelpers/logger";

import { displayName as appName } from "../../../../app.json";

const logger = log.extend( "savePhotosToPhotoLibrary" );

// Save URIs to camera photo library (if a photo was taken using the app,
// we want it accessible in the camera's folder, as if the user has taken those photos
// via their own camera app).
// One could argue this is a private method and shouldn't be exported and
// doesn't need to be tested... but hooks are complicated and this hook might
// be too complicated, so this at least makes it easy to test this one part
// ~~~kueda20240614
// $FlowIgnore
export async function savePhotosToPhotoLibrary(
  uris: [string],
  location: object
) {
  const readWritePermissionResult = permissionResultFromMultiple(
    await checkMultiple( READ_WRITE_MEDIA_PERMISSIONS )
  );
  const savedPhotoUris = await uris.reduce(
    async ( memo, uri ) => {
      const savedUris = await memo;
      try {
        const saveOptions = {};
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
        if (
          cameraRollSaveError.message.match( /No space left on device/ )
          || cameraRollSaveError.message.match( /PHPhotosErrorDomain error 3305/ )
        ) {
          Alert.alert(
            t( "Not-enough-space-left-on-device" ),
            t( "Not-enough-space-left-on-device-try-again" ),
            [{ text: t( "OK" ) }]
          );
          return savedUris;
        }
        // This means an iOS user denied access
        // (https://developer.apple.com/documentation/photokit/phphotoserror/code/accessuserdenied).
        // In theory we should not even have called this function when that
        // happens, but we're still seeing this in the logs. They should be
        // prompted to grant permission the next time they try so this is
        // probably safe to ignore.
        if ( !cameraRollSaveError.message.match( /error 3311/ ) ) {
          logger.error( cameraRollSaveError );
          return savedUris;
        }
        throw cameraRollSaveError;
      }
    },
    // We need the initial value even if we're not using it, otherwise reduce
    // will treat the first item in the array as the initial value and not
    // call the reducer function on it
    Promise.resolve( [] )
  );
  return savedPhotoUris;
}

export default savePhotosToPhotoLibrary;
