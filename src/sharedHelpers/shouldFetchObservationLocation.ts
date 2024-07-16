import { galleryPhotosPath } from "appConstants/paths.ts";
import RNFS from "react-native-fs";
import { RealmObservation } from "realmModels/types.d.ts";
import {
  TARGET_POSITIONAL_ACCURACY
} from "sharedHooks/useWatchPosition.ts";

const shouldFetchObservationLocation = ( observation: RealmObservation ) => {
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
    && !isSharedPhoto;
};

export default shouldFetchObservationLocation;
