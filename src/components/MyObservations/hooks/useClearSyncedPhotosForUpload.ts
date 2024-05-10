import { photoUploadPath } from "appConstants/paths.ts";
import { RealmContext } from "providers/contexts";
import { useEffect } from "react";
import RNFS from "react-native-fs";
import Observation from "realmModels/Observation";
import { log } from "sharedHelpers/logger";

const logger = log.extend( "useClearSyncedPhotosForUpload" );

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

  const unsyncedLocalFilePaths = unsyncedObservations.map( observation => {
    const { observationPhotos } = observation;
    const { photo } = observationPhotos[0];
    const { localFilePath } = photo;
    if ( localFilePath ) {
      return localFilePath.split( "photoUploads/" )[1];
    }
    return null;
  } );

  useEffect( ( ) => {
    const clearSyncedPhotos = async ( ) => {
      const directoryExists = await RNFS.exists( photoUploadPath );
      if ( !directoryExists ) { return null; }

      const files = await RNFS.readDir( photoUploadPath );

      const clearSynced = files.forEach( async ( { path, name } ) => {
        const pathExists = await RNFS.exists( path );
        if ( !pathExists ) { return; }
        if ( unsyncedLocalFilePaths.includes( name ) ) {
          return;
        }
        logger.info( "unlinking", path, "from photoUploads/" );
        await RNFS.unlink( path );
      } );
      return clearSynced;
    };

    clearSyncedPhotos( );
  }, [unsyncedLocalFilePaths] );
  return null;
};

export default useClearSyncedPhotosForUpload;
