import { exists, readDir } from "@dr.pogodin/react-native-fs";
import {
  computerVisionPath,
  photoLibraryPhotosPath,
  photoUploadCopiesPath,
  photoUploadPath,
  rollbackPhotosPath,
  rotatedOriginalPhotosPath,
  soundUploadPath,
} from "appConstants/paths";
import removeAllFilesFromDirectory from "sharedHelpers/removeAllFilesFromDirectory";
import removeSyncedFilesFromDirectory from "sharedHelpers/removeSyncedFilesFromDirectory";
import { unlink } from "sharedHelpers/util";

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

const clearComputerVisionPhotos = async ( ) => {
  // Clears resized images used for inatjs.computervision.score_image
  await removeAllFilesFromDirectory( computerVisionPath );
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

const clearRollbackPhotos = async ( ) => {
  await removeAllFilesFromDirectory( rollbackPhotosPath );
};

// Upload copies are deleted as soon as their upload finishes, so anything left
// here was orphaned by a crash or a killed app. The age check keeps this from
// deleting a copy that an upload started since launch is still sending.
const STALE_UPLOAD_COPY_MS = 60 * 60 * 1000;

const clearStalePhotoUploadCopies = async ( ) => {
  if ( !( await exists( photoUploadCopiesPath ) ) ) return;
  const cutoff = Date.now( ) - STALE_UPLOAD_COPY_MS;
  const files = await readDir( photoUploadCopiesPath );
  await Promise.all( files
    .filter( file => ( file.mtime?.getTime( ) ?? 0 ) < cutoff )
    .map( file => unlink( file.path ) ) );
};

export {
  clearComputerVisionPhotos,
  clearGalleryPhotos,
  clearRollbackPhotos,
  clearRotatedOriginalPhotosDirectory,
  clearStalePhotoUploadCopies,
  clearSyncedMediaForUpload,
};
