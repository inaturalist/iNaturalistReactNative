import { photoUploadPath } from "appConstants/paths.ts";
import { RealmContext } from "providers/contexts";
import { useEffect } from "react";
import Observation from "realmModels/Observation";
import removeSyncedFilesFromDirectory from "sharedHelpers/removeSyncedFilesFromDirectory.ts";

const { useQuery } = RealmContext;

// this hook checks to see which localFilePaths are still needed in photoUploads/
// and only keeps the references to photos which have not yet been uploaded
// clearing this directory helps to keep the app size small
const useClearSyncedPhotosForUpload = ( ) => {
  const unsyncedObservationPhotos = "observationPhotos._synced_at == nil";

  const unsyncedObservations = useQuery(
    Observation,
    observations => observations.filtered( unsyncedObservationPhotos )
  );

  const unsyncedPhotos = unsyncedObservations.map( observation => {
    const { observationPhotos } = observation;
    const { photo } = observationPhotos[0];
    const { localFilePath } = photo;
    if ( localFilePath ) {
      return localFilePath.split( "photoUploads/" )[1];
    }
    return null;
  } );

  useEffect( ( ) => {
    removeSyncedFilesFromDirectory( photoUploadPath, unsyncedPhotos );
  }, [unsyncedPhotos] );
  return null;
};

export default useClearSyncedPhotosForUpload;
