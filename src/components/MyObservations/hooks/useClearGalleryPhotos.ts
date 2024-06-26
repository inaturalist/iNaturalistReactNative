import { galleryPhotosPath } from "appConstants/paths.ts";
import { useEffect } from "react";
import removeAllFilesFromDirectory from "sharedHelpers/removeAllFilesFromDirectory.ts";

const useClearGalleryPhotos = ( ) => {
  useEffect( ( ) => {
    const clearGalleryPhotos = async ( ) => {
      await removeAllFilesFromDirectory( galleryPhotosPath );
    };

    clearGalleryPhotos( );
  }, [] );
  return null;
};

export default useClearGalleryPhotos;
