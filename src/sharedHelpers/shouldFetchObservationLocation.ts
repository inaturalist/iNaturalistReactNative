import { photoLibraryPhotosPath, rotatedOriginalPhotosPath } from "appConstants/paths.ts";
import { DocumentDirectoryPath } from "react-native-fs";
import type { RealmObservation } from "realmModels/types.d.ts";
import {
  TARGET_POSITIONAL_ACCURACY
} from "sharedHooks/useWatchPosition.ts";

// In theory all of these functions belong in Observation.js... but we often
// map API responses to behave like Realm records, so they don't always have
// the methods

function originalPhotoUri( observation: RealmObservation ) {
  return observation?.observationPhotos?.[0]?.originalPhotoUri || "";
}

function isNew( observation: RealmObservation ) {
  return (
    observation
    && !observation._created_at
    && !observation._synced_at
  );
}

function isFromGallery( observation: RealmObservation ) {
  return originalPhotoUri( observation ).includes( photoLibraryPhotosPath );
}

function isFromSharing( observation: RealmObservation ) {
  // Shared photo paths will look something like Shared/AppGroup/sdgsdgsdgk
  const uri = originalPhotoUri( observation );
  return uri && !uri.includes( DocumentDirectoryPath );
}

function isFromCamera( observation: RealmObservation ) {
  return originalPhotoUri( observation ).includes( rotatedOriginalPhotosPath );
}

function shouldFetchObservationLocation( observation: RealmObservation ) {
  const latitude = observation?.latitude;
  const longitude = observation?.longitude;
  const hasLocation = !!( latitude && longitude );
  const accGoodEnough = (
    observation?.positional_accuracy
    && observation.positional_accuracy <= TARGET_POSITIONAL_ACCURACY
  );

  return observation
    && isNew( observation )
    && ( !hasLocation || ( isFromCamera( observation ) && !accGoodEnough ) )
    && !isFromGallery( observation )
    && !isFromSharing( observation );
}

export default shouldFetchObservationLocation;
