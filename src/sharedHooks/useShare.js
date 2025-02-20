// @flow

import { useNavigation } from "@react-navigation/native";
import { useCallback, useEffect } from "react";
import ShareMenu from "react-native-share-menu";

type SharedItem = {
  mimeType: string,
  data: string | Array<string>
};

const useShare = ( ): void => {
  const navigation = useNavigation( );

  const handleShare = useCallback( ( item: ?SharedItem ) => {
    if ( !item ) {
      // user hasn't shared any items
      return;
    }

    const { mimeType, data } = item;

    if ( !mimeType && !data ) {
      // user hasn't shared any images
      return;
    }

    // show user a loading animation screen (like PhotoLibrary)
    // while observations are created
    navigation.navigate( "PhotoSharing", { item } );
  }, [navigation] );

  useEffect( ( ) => {
    ShareMenu.getInitialShare( handleShare );
  }, [handleShare] );

  useEffect( ( ) => {
    const listener = ShareMenu.addNewShareListener( handleShare );

    return ( ) => {
      listener?.remove( );
    };
  }, [handleShare] );
};

export default useShare;
