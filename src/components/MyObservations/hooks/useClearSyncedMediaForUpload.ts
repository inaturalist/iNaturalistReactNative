import { photoUploadPath, soundUploadPath } from "appConstants/paths.ts";
import { RealmContext } from "providers/contexts";
import { useEffect, useState } from "react";
import removeSyncedFilesFromDirectory from "sharedHelpers/removeSyncedFilesFromDirectory.ts";

const RUN_EVERY_MS = (
  1000 // 1 second
  * 60 // 1 minute
);

// TODO replace when Realm classes are properly typed
interface RealmObservation {
  observationPhotos: {
    photo: {
      localFilePath: string
    }
  }[],
  observationSounds: {
    sound: {
      fileUrl: string
    }
  }[]
}

const { useRealm } = RealmContext;

// this hook checks to see which localFilePaths are still needed in photoUploads/
// and only keeps the references to photos which have not yet been uploaded
// clearing this directory helps to keep the app size small
const useClearSyncedPhotosForUpload = ( enabled: boolean ) => {
  const [runAt, setRunAt] = useState<number>();
  const realm = useRealm( );

  useEffect( ( ) => {
    function clean() {
      // Clean out photos
      const unsyncedObservationsWithPhotos: RealmObservation[] = realm
        .objects( "Observation" )
        .filtered( "observationPhotos._synced_at == nil" );
      const unsyncedPhotoFileNames = unsyncedObservationsWithPhotos
        .map( observation => observation.observationPhotos.map(
          op => op.photo.localFilePath?.split( "photoUploads/" )?.at( 1 )
        ) )
        .flat( )
        .filter( Boolean );
      removeSyncedFilesFromDirectory(
        photoUploadPath,
        // .filter( Boolean ) ensures this array has no undefined members. IDK
        //  why the TS compiler can't figure that out
        //  eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        unsyncedPhotoFileNames
      );

      // Clean out photos
      const unsyncedObservationsWithSounds: RealmObservation[] = realm
        .objects( "Observation" )
        .filtered( "observationSounds._synced_at == nil" );
      const unsyncedSoundFileNames = unsyncedObservationsWithSounds
        .map( observation => observation.observationSounds.map(
          os => os.sound.fileUrl?.split( "soundUploads/" )?.at( 1 )
        ) )
        .flat( )
        .filter( Boolean );
      removeSyncedFilesFromDirectory(
        soundUploadPath,
        // .filter( Boolean ) ensures this array has no undefined members. IDK
        //  why the TS compiler can't figure that out
        //  eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        unsyncedSoundFileNames
      );
    }
    if ( enabled && ( !runAt || ( Date.now( ) - runAt ) >= RUN_EVERY_MS ) ) {
      setRunAt( Date.now( ) );
      clean();
    }
  }, [enabled, realm, runAt] );
  return null;
};

export default useClearSyncedPhotosForUpload;
