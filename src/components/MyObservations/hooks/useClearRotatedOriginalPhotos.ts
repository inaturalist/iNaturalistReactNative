import { rotatedOriginalPhotosPath } from "appConstants/paths.ts";
import { useEffect } from "react";
import removeAllFilesFromDirectory from "sharedHelpers/removeAllFilesFromDirectory.ts";

const useClearRotatedOriginalPhotos = ( ) => {
  useEffect( ( ) => {
    const clearRotatedOriginalPhotosDirectory = async ( ) => {
      await removeAllFilesFromDirectory( rotatedOriginalPhotosPath );
    };

    clearRotatedOriginalPhotosDirectory( );
  }, [] );
  return null;
};

export default useClearRotatedOriginalPhotos;
