import {
  copyFile,
  DocumentDirectoryPath,
  exists,
  mkdir,
} from "@dr.pogodin/react-native-fs";
import { photoLibraryPhotosPath } from "appConstants/paths";
import { Platform } from "react-native";
import { log } from "sharedHelpers/logger";
import { unlink } from "sharedHelpers/util";
import type { GroupedPhoto } from "stores/createObservationFlowSlice";

const logger = log.extend( "shareExtensionFiles" );

interface SharedPhoto {
  image: {
    uri: string;
  };
}

type GroupedPhotoItem = GroupedPhoto["photos"][number];

export function isShareExtensionPhotoUri( pathOrUri: string ): boolean {
  if ( !pathOrUri || pathOrUri.match( /^ph:/ ) ) {
    return false;
  }
  if ( pathOrUri.includes( DocumentDirectoryPath ) ) {
    return false;
  }
  return pathOrUri.includes( "Shared/AppGroup" );
}

function pathForFilesystem( pathOrUri: string ): string {
  if ( pathOrUri.match( /^file:\/\// ) ) {
    return pathOrUri.replace( /^file:\/\//, "" );
  }
  return pathOrUri;
}

function fileNameFromUri( pathOrUri: string ): string {
  const path = pathForFilesystem( pathOrUri );
  const pieces = path.split( "/" );
  return pieces[pieces.length - 1];
}

// For iOS share-extension photos only. Duplicated from PhotoLibrary staging (no Android path).
// Copy, exists?, then unlink is more defensive then the plain move in PhotoLibrary but we are
// moving across two different containers (App Group and Main App Documents) so maybe warranted.
async function moveSingleSharePhotoToGallery(
  photo: GroupedPhotoItem,
): Promise<GroupedPhotoItem> {
  if ( Platform.OS !== "ios" ) {
    return photo;
  }

  const { uri } = photo.image;
  if ( !isShareExtensionPhotoUri( uri ) ) {
    return photo;
  }

  await mkdir( photoLibraryPhotosPath );

  const fileName = fileNameFromUri( uri );
  const sourcePath = pathForFilesystem( uri );
  const destPath = `${photoLibraryPhotosPath}/${fileName}`;

  await copyFile( sourcePath, destPath );

  const destExists = await exists( destPath );
  if ( !destExists ) {
    throw new Error( `Share photo staging failed: ${destPath}` );
  }

  try {
    await unlink( sourcePath );
  } catch ( error ) {
    logger.error( "Failed to remove App Group source after staging copy", error );
  }

  return {
    ...photo,
    image: {
      ...photo.image,
      uri: `file://${destPath}`,
    },
  };
}

export async function moveSharedGroupedPhotos(
  groupedPhotos: GroupedPhoto[],
): Promise<GroupedPhoto[]> {
  try {
    return await Promise.all(
      groupedPhotos.map( async group => ( {
        photos: await Promise.all(
          group.photos.map( photo => moveSingleSharePhotoToGallery( photo ) ),
        ),
      } ) ),
    );
  } catch ( error ) {
    logger.error( `Failed to move share-extension photos to Documents ${error}` );
    throw error;
  }
}

export async function unlinkIfShareExtensionSource( sharedPhoto: SharedPhoto ): Promise<void> {
  const pathOrUri = sharedPhoto.image.uri;
  if ( !isShareExtensionPhotoUri( pathOrUri ) ) {
    return;
  }
  try {
    await unlink( pathForFilesystem( pathOrUri ) );
  } catch ( error ) {
    logger.error( `Failed to unlink share-extension source ${error}` );
  }
}

export async function unlinkIfShareExtensionSources(
  sharedPhotos: SharedPhoto[],
): Promise<void> {
  await Promise.all(
    sharedPhotos.map( sharedPhoto => unlinkIfShareExtensionSource( sharedPhoto ) ),
  );
}
