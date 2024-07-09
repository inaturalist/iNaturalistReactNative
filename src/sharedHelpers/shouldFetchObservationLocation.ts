import { galleryPhotosPath } from "appConstants/paths.ts";
import {
  LOCATION_PERMISSIONS,
  permissionResultFromMultiple
} from "components/SharedComponents/PermissionGateContainer";
import RNFS from "react-native-fs";
import {
  checkMultiple,
  RESULTS
} from "react-native-permissions";
import { RealmObservation } from "realmModels/types.d.ts";

export const TARGET_POSITIONAL_ACCURACY = 10;

export const checkLocationPermission = async ( ) => {
  const newPermissionResult = permissionResultFromMultiple(
    await checkMultiple( LOCATION_PERMISSIONS )
  );
  return newPermissionResult;
};

export const shouldFetchObservationLocation = async ( observation: RealmObservation[] ) => {
  const permissionResult = await checkLocationPermission( );
  const latitude = observation?.latitude;
  const longitude = observation?.longitude;
  const hasLocation = !!( latitude && longitude );
  const originalPhotoUri = observation?.observationPhotos
    && observation?.observationPhotos[0]?.originalPhotoUri;
  const isGalleryPhoto = originalPhotoUri?.includes( galleryPhotosPath );
  // Shared photo paths will look something like Shared/AppGroup/sdgsdgsdgk
  const isSharedPhoto = (
    originalPhotoUri && !originalPhotoUri.includes( RNFS.DocumentDirectoryPath )
  );
  const isNewObservation = (
    !observation?._created_at
    && !observation?._synced_at
  );
  const accGoodEnough = (
    observation?.positional_accuracy
    && observation.positional_accuracy <= TARGET_POSITIONAL_ACCURACY
  );

  return observation
    && isNewObservation
    && ( !hasLocation || !accGoodEnough )
    && !isGalleryPhoto
    && !isSharedPhoto
    && permissionResult === RESULTS.GRANTED;
};
