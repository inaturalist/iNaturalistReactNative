import { RealmContext } from "providers/contexts";
import { useCallback, useRef } from "react";
import Photo from "realmModels/Photo";
import type { PhotoEdits } from "sharedHelpers/editLocalPhoto";
import editLocalPhoto from "sharedHelpers/editLocalPhoto";
import { log } from "sharedHelpers/logger";
import { unlink } from "sharedHelpers/util";

const { useRealm } = RealmContext;

const logger = log.extend( "useEditLocalPhoto" );

// Returns a function that writes an edited copy of a local photo and passes
// the photo's current URI and the copy's path to onEditPhoto. New edits are
// ignored while one is still being written to disk.
//
// Each edit writes a new file. When an edit replaces a copy an earlier edit
// here wrote, that copy is deleted, so rotating a photo several times doesn't
// leave a full-size file behind for each turn. The photo as it was before
// editing is never deleted, so leaving without saving can fall back to it
const useEditLocalPhoto = (
  onEditPhoto?: ( uri: string, newLocalFilePath: string ) => void,
) => {
  const realm = useRealm( );
  const editingRef = useRef( false );
  // Copies written by edits here that a later edit may replace
  const editedCopiesRef = useRef( new Set<string>( ) );

  // Deletes a copy an earlier edit wrote, unless a saved observation uses it
  const deleteReplacedCopy = useCallback( async ( localFilePath: string ) => {
    if ( !editedCopiesRef.current.has( localFilePath ) ) return;
    editedCopiesRef.current.delete( localFilePath );
    const fileName = localFilePath.split( "photoUploads/" ).at( 1 );
    const savedUses = realm.objects( "Observation" ).filtered(
      "ANY observationPhotos.photo.localFilePath ENDSWITH $0",
      `photoUploads/${fileName}`,
    );
    if ( savedUses.length > 0 ) return;
    const uri = Photo.getLocalPhotoUri( localFilePath );
    if ( !uri ) return;
    try {
      await unlink( uri.replace( /^file:\/\//, "" ) );
    } catch ( unlinkError ) {
      logger.error( "Failed to delete replaced photo copy", unlinkError );
    }
  }, [realm] );

  return useCallback( async ( localFilePath: string, edits: PhotoEdits ) => {
    const photoUri = Photo.getLocalPhotoUri( localFilePath );
    if ( !onEditPhoto || !photoUri || editingRef.current ) return;
    editingRef.current = true;
    try {
      const editedPath = await editLocalPhoto( localFilePath, edits );
      onEditPhoto( photoUri, editedPath );
      editedCopiesRef.current.add( editedPath );
    } catch ( editError ) {
      logger.error( "Failed to edit photo", editError );
      return;
    } finally {
      editingRef.current = false;
    }
    await deleteReplacedCopy( localFilePath );
  }, [deleteReplacedCopy, onEditPhoto] );
};

export default useEditLocalPhoto;
