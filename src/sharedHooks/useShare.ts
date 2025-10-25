// @flow

import { useEffect } from "react";
import ShareMenu from "react-native-share-menu";

const useShare = ( onShare: ( ) => void ): void => {
  useEffect( ( ) => {
    ShareMenu.getInitialShare( onShare );
  }, [onShare] );

  useEffect( ( ) => {
    const listener = ShareMenu.addNewShareListener( onShare );

    return ( ) => {
      listener?.remove( );
    };
  }, [onShare] );
};

export default useShare;
