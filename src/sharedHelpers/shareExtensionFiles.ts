import {
  DocumentDirectoryPath,
} from "@dr.pogodin/react-native-fs";
import { unlink } from "sharedHelpers/util";

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

export async function unlinkShareExtensionSourceIfNeeded( pathOrUri: string ): Promise<void> {
  if ( !isShareExtensionPhotoUri( pathOrUri ) ) {
    return;
  }
  try {
    // await unlink( pathForUnlink( pathOrUri ) );
    console.log( pathForUnlink( pathOrUri ) );
    console.log( unlink );
  } catch {
    // Best-effort cleanup; do not fail observation creation
  }
}
