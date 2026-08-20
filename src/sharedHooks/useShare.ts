import { useEffect } from "react";
import ShareMenu from "react-native-share-menu";

export interface SharedData {
 data: {
  mimeType: string;
  data: string;
 }[] | null;
 extraData?: unknown;
}

const useShare = ( onShare: ( data?: SharedData | null ) => void ): void => {
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
