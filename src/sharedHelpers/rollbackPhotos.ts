import { photoUploadPath, rollbackPhotosPath } from "appConstants/paths";
import RNFS from "react-native-fs";
import type { RealmObservationPojo } from "realmModels/types";
import { log } from "sharedHelpers/logger";
import removeAllFilesFromDirectory from "sharedHelpers/removeAllFilesFromDirectory";

import { unlink } from "./util";

const logger = log.extend( "rollbackPhotos" );

export interface BackupMapping {
  originalPath: string;
  backupPath: string;
}

const getLocalPhotoPath = ( localFilePath: string ): string | null => {
  const pieces = localFilePath?.split( "photoUploads/" );
  if ( !pieces || pieces.length <= 1 ) return null;
  return `${photoUploadPath}/${pieces[1]}`;
};

export const clearRollbackPhotos = async ( ): Promise<void> => {
  try {
    await removeAllFilesFromDirectory( rollbackPhotosPath );
    const dirExists = await RNFS.exists( rollbackPhotosPath );
    if ( dirExists ) {
      await RNFS.unlink( rollbackPhotosPath );
    }
  } catch ( e ) {
    logger.error( `clearRollbackPhotos error: ${e}` );
  }
};

export const backupObservationPhotos = async (
  observations: RealmObservationPojo[],
  currentObservationIndex: number,
): Promise<BackupMapping[]> => {
  try {
    const observation = observations[currentObservationIndex];
    if ( !observation ) return [];

    const obsPhotos = observation.observationPhotos || [];
    const photosWithLocalPath = obsPhotos.filter(
      op => op?.photo?.localFilePath,
    );

    if ( photosWithLocalPath.length === 0 ) return [];

    await RNFS.mkdir( rollbackPhotosPath );

    const results = await Promise.all(
      photosWithLocalPath.map( async ( op ): Promise<BackupMapping | null> => {
        const { localFilePath } = op.photo;
        if ( !localFilePath ) return null;
        const originalPath = getLocalPhotoPath( localFilePath );
        const filename = localFilePath.split( "/" ).pop( );
        if ( !originalPath || !filename ) return null;

        const backupPath = `${rollbackPhotosPath}/${filename}`;
        const sourceExists = await RNFS.exists( originalPath );
        if ( !sourceExists ) {
          logger.warn(
            `backupObservationPhotos: source not found: ${originalPath}`,
          );
          return null;
        }

        await RNFS.copyFile( originalPath, backupPath );
        return { originalPath, backupPath };
      } ),
    );

    const mappings = results.filter(
      ( m ): m is BackupMapping => m !== null,
    );
    logger.info(
      `backupObservationPhotos: backed up ${mappings.length} photos`,
    );
    return mappings;
  } catch ( e ) {
    logger.error( `backupObservationPhotos error: ${e}` );
    return [];
  }
};

export const restoreObservationPhotos = async (
  backupMappings: BackupMapping[],
): Promise<void> => {
  await Promise.all(
    backupMappings.map( async mapping => {
      const backupExists = await RNFS.exists( mapping.backupPath );
      if ( !backupExists ) {
        throw new Error(
          `restoreObservationPhotos: backup missing: ${mapping.backupPath}`,
        );
      }
      const originalExists = await RNFS.exists( mapping.originalPath );
      if ( originalExists ) {
        await unlink( mapping.originalPath );
      }
      await RNFS.copyFile( mapping.backupPath, mapping.originalPath );
    } ),
  );
  await clearRollbackPhotos( );
};
