import { computerVisionPath } from "appConstants/paths";
import { useEffect } from "react";
import removeAllFilesFromDirectory from "sharedHelpers/removeAllFilesFromDirectory";

const useClearComputerVisionDirectory = ( ) => {
  useEffect( ( ) => {
    // this isn't perfect, since it doesn't delete the current resized image(s) created in
    // useOnlineSuggestions, and the resizer is seemingly getting called multiple times
    // on the same image. but for storage size, it's an improvement on what we were doing
    // before, which was storing an infinite amount of resized images used temporarily
    // for the online API
    const clearComputerVisionDirectory = async ( ) => {
      await removeAllFilesFromDirectory( computerVisionPath );
    };

    clearComputerVisionDirectory( );
  }, [] );
  return null;
};

export default useClearComputerVisionDirectory;
