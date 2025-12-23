import {
  photoLibraryPhotosPath, photoUploadPath, rotatedOriginalPhotosPath, soundUploadPath,
} from "appConstants/paths";
import { log } from "sharedHelpers/logger";
import removeAllFilesFromDirectory from "sharedHelpers/removeAllFilesFromDirectory";
import removeSyncedFilesFromDirectory from "sharedHelpers/removeSyncedFilesFromDirectory";

const logger = log.extend( "clearCaches.ts" );

// TODO replace when Realm classes are properly typed
interface RealmObservation {
  observationPhotos: {
    photo: {
      localFilePath: string;
    };
  }[];
  observationSounds: {
    sound: {
      file_url: string;
    };
  }[];
}

const clearRotatedOriginalPhotosDirectory = async ( ) => {
  await removeAllFilesFromDirectory( rotatedOriginalPhotosPath );
};

const clearGalleryPhotos = async ( ) => {
  await removeAllFilesFromDirectory( photoLibraryPhotosPath );
};

// this hook checks to see which localFilePaths are still needed in photoUploads/
// and only keeps the references to photos which have not yet been uploaded
// clearing this directory helps to keep the app size small

const clearSyncedMediaForUpload = async realm => {
// Clean out photos
  const unsyncedObservationsWithPhotos: RealmObservation[] = realm
    .objects( "Observation" )
    .filtered( "observationPhotos._synced_at == nil" );
  const unsyncedPhotoFileNames = unsyncedObservationsWithPhotos
    .map( observation => observation.observationPhotos.map(
      op => op.photo.localFilePath?.split( "photoUploads/" )?.at( 1 ),
    ) )
    .flat( )
    .filter( Boolean );
  await removeSyncedFilesFromDirectory(
    photoUploadPath,
    // .filter( Boolean ) ensures this array has no undefined members. IDK
    //  why the TS compiler can't figure that out
    //  eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    unsyncedPhotoFileNames,
  );

  // Clean out sounds
  const unsyncedObservationsWithSounds: RealmObservation[] = realm
    .objects( "Observation" )
    .filtered( "observationSounds._synced_at == nil" );
  const unsyncedSoundFileNames = unsyncedObservationsWithSounds
    .map( observation => observation.observationSounds.map(
      os => os.sound.file_url?.split( "soundUploads/" )?.at( 1 ),
    ) )
    .flat( )
    .filter( Boolean );
  await removeSyncedFilesFromDirectory(
    soundUploadPath,
    // .filter( Boolean ) ensures this array has no undefined members. IDK
    //  why the TS compiler can't figure that out
    //  eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    unsyncedSoundFileNames,
  );
};

const clearCaches = async ( isDebugMode, realm ) => {
  // clear original, large-sized photos
  await clearRotatedOriginalPhotosDirectory( );
  await clearGalleryPhotos( );
  await clearSyncedMediaForUpload( realm );
  if ( isDebugMode ) {
    logger.info( "cleared rotated original photos, gallery, and synced media caches" );
  }
};

export default clearCaches;
