import { soundUploadPath } from "appConstants/paths.ts";
import { RealmContext } from "providers/contexts";
import { useEffect } from "react";
import Observation from "realmModels/Observation";
import removeSyncedFilesFromDirectory from "sharedHelpers/removeSyncedFilesFromDirectory.ts";

const { useQuery } = RealmContext;

// this hook checks to see which localFilePaths are still needed in soundUploads/
// and only keeps the references to sounds which have not yet been uploaded
// clearing this directory helps to keep the app size small
const useClearSyncedSoundsForUpload = ( ) => {
  const unsyncedObservationSounds = "observationSounds._synced_at == nil";

  const unsyncedObservations = useQuery(
    Observation,
    observations => observations.filtered( unsyncedObservationSounds )
  );

  const unsyncedSounds = unsyncedObservations.map( observation => {
    const { observationSounds } = observation;
    const { sound } = observationSounds[0];
    const { file_url: fileUrl } = sound;
    if ( fileUrl ) {
      return fileUrl.split( "soundUploads/" )[1];
    }
    return null;
  } );

  useEffect( ( ) => {
    const clearSyncedSounds = async ( ) => {
      await removeSyncedFilesFromDirectory( soundUploadPath, unsyncedSounds );
    };

    clearSyncedSounds( );
  }, [unsyncedSounds] );
  return null;
};

export default useClearSyncedSoundsForUpload;
