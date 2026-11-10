import { useCallback, useRef } from "react";
import Photo from "realmModels/Photo";
import type { PhotoEdits } from "sharedHelpers/editLocalPhoto";
import editLocalPhoto from "sharedHelpers/editLocalPhoto";
import { log } from "sharedHelpers/logger";

const logger = log.extend( "useEditLocalPhoto" );

// Returns a function that writes an edited copy of a local photo and passes
// the photo's current URI and the copy's path to onEditPhoto. New edits are
// ignored while one is still being written to disk
const useEditLocalPhoto = (
  onEditPhoto?: ( uri: string, newLocalFilePath: string ) => void,
) => {
  const editingRef = useRef( false );
  return useCallback( async ( localFilePath: string, edits: PhotoEdits ) => {
    const photoUri = Photo.getLocalPhotoUri( localFilePath );
    if ( !onEditPhoto || !photoUri || editingRef.current ) return;
    editingRef.current = true;
    try {
      const editedPath = await editLocalPhoto( localFilePath, edits );
      onEditPhoto( photoUri, editedPath );
    } catch ( editError ) {
      logger.error( "Failed to edit photo", editError );
    } finally {
      editingRef.current = false;
    }
  }, [onEditPhoto] );
};

export default useEditLocalPhoto;
