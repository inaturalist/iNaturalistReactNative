import { photoUploadPath } from "appConstants/paths.ts";
import { RealmContext } from "providers/contexts";
import { useEffect } from "react";
import Observation from "realmModels/Observation";
import removeSyncedFilesFromDirectory from "sharedHelpers/removeSyncedFilesFromDirectory.ts";
import useStore from "stores/useStore";

const { useQuery } = RealmContext;

// this hook checks to see which localFilePaths are still needed in photoUploads/
// and only keeps the references to photos which have not yet been uploaded
// clearing this directory helps to keep the app size small
const useClearSyncedPhotosForUpload = ( ) => {
  const currentObservations = useStore( state => state.observations );
  const unsyncedObservations = useQuery(
    Observation,
    observations => observations.filtered( "observationPhotos._synced_at == nil" )
  );

  const unsyncedPhotoFileNames = unsyncedObservations
    .map( observation => observation.observationPhotos.map(
      op => op.photo.localFilePath?.split( "photoUploads/" )?.at( 1 )
    ) )
    .flat( )
    .filter( Boolean );

  useEffect( ( ) => {
    if ( !currentObservations ) {
      removeSyncedFilesFromDirectory( photoUploadPath, unsyncedPhotoFileNames );
    }
  }, [currentObservations, unsyncedPhotoFileNames] );
  return null;
};

export default useClearSyncedPhotosForUpload;
