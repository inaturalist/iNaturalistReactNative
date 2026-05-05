import {
  copyFile,
  exists,
  mkdir,
} from "@dr.pogodin/react-native-fs";
import { photoUploadPath, rollbackPhotosPath } from "appConstants/paths";
import type { RealmObservationPojo } from "realmModels/types";
import { clearRollbackPhotos } from "sharedHelpers/clearCaches";
import { log } from "sharedHelpers/logger";
import { unlink } from "sharedHelpers/util";

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

export const backupObservationPhotos = async (
  observation: RealmObservationPojo,
): Promise<BackupMapping[]> => {
  try {
    if ( !observation ) return [];

    const obsPhotos = observation.observationPhotos || [];
    const photosWithLocalPath = obsPhotos.filter(
      op => op?.photo?.localFilePath,
    );

    if ( photosWithLocalPath.length === 0 ) return [];

    await mkdir( rollbackPhotosPath );

    const results = await Promise.all(
      photosWithLocalPath.map( async ( op ): Promise<BackupMapping | null> => {
        const { localFilePath } = op.photo;
        if ( !localFilePath ) return null;
        const originalPath = getLocalPhotoPath( localFilePath );
        const filename = localFilePath.split( "/" ).pop( );
        if ( !originalPath || !filename ) return null;

        const backupPath = `${rollbackPhotosPath}/${filename}`;
        const sourceExists = await exists( originalPath );
        if ( !sourceExists ) {
          logger.warn(
            `backupObservationPhotos: source not found: ${originalPath}`,
          );
          return null;
        }

        await copyFile( originalPath, backupPath );
        return { originalPath, backupPath };
      } ),
    );

    const mappings = results.filter(
      m => m !== null,
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
  try {
    await Promise.all(
      backupMappings.map( async mapping => {
        const backupExists = await exists( mapping.backupPath );
        if ( !backupExists ) {
          logger.warn(
            `restoreObservationPhotos: backup missing: ${mapping.backupPath}`,
          );
          return;
        }
        const originalExists = await exists( mapping.originalPath );
        if ( originalExists ) {
          await unlink( mapping.originalPath );
        }
        await copyFile( mapping.backupPath, mapping.originalPath );
      } ),
    );
    await clearRollbackPhotos( );
  } catch ( e ) {
    logger.error( `restoreObservationPhotos error: ${e}` );
  }
};
