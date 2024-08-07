import { galleryPhotosPath } from "appConstants/paths.ts";
import RNFS from "react-native-fs";
import { RealmObservation } from "realmModels/types.d.ts";

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
    observation
    && !observation?._created_at
    && !observation?._synced_at
  );

  return observation
    && isNewObservation
    && !hasLocation
    && !isGalleryPhoto
    && !isSharedPhoto;
};

export default shouldFetchObservationLocation;
