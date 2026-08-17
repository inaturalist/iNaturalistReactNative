import {
  DocumentDirectoryPath,
} from "@dr.pogodin/react-native-fs";
import { log } from "sharedHelpers/logger";
import { unlink } from "sharedHelpers/util";

const logger = log.extend( "shareExtensionFiles" );

export function isShareExtensionPhotoUri( pathOrUri: string ): boolean {
  if ( !pathOrUri || pathOrUri.match( /^ph:/ ) ) {
    return false;
  }
  if ( pathOrUri.includes( DocumentDirectoryPath ) ) {
    return false;
  }
  return pathOrUri.includes( "Shared/AppGroup" );
}

function pathForUnlink( pathOrUri: string ): string {
  if ( pathOrUri.match( /^file:\/\// ) ) {
    return pathOrUri.replace( /^file:\/\//, "" );
  }
  return pathOrUri;
}

interface SharedPhoto { image: { uri: string }}

export async function unlinkIfShareExtensionSource( sharedPhoto: SharedPhoto ): Promise<void> {
  const pathOrUri = sharedPhoto.image.uri;
  if ( !isShareExtensionPhotoUri( pathOrUri ) ) {
    return;
  }
  try {
    await unlink( pathForUnlink( pathOrUri ) );
  } catch ( error ) {
    logger.error( `Failed to unlink share-extension source ${error}` );
  }
}
