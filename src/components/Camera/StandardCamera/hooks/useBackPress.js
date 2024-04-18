// @flow

import { useFocusEffect } from "@react-navigation/native";
import {
  useCallback,
  useState
} from "react";
import {
  BackHandler
} from "react-native";
import useStore from "stores/useStore";

const useBackPress = ( onBack: any ): any => {
  const [showDiscardSheet, setShowDiscardSheet] = useState( false );
  const cameraPreviewUris = useStore( state => state.cameraPreviewUris );

  const handleBackButtonPress = useCallback( ( ) => {
    if ( cameraPreviewUris.length > 0 ) {
      setShowDiscardSheet( true );
    } else {
      onBack();
    }
  }, [setShowDiscardSheet, cameraPreviewUris, onBack] );

  useFocusEffect(
    // note: cannot use navigation.addListener to trigger bottom sheet in tab navigator
    // since the screen is unfocused, not removed from navigation
    useCallback( ( ) => {
      // make sure an Android user cannot back out and accidentally discard photos
      const onBackPress = ( ) => {
        handleBackButtonPress( );
        return true;
      };

      BackHandler.addEventListener( "hardwareBackPress", onBackPress );

      return ( ) => BackHandler.removeEventListener( "hardwareBackPress", onBackPress );
    }, [handleBackButtonPress] )
  );

  return {
    handleBackButtonPress,
    setShowDiscardSheet,
    showDiscardSheet
  };
};

export default useBackPress;
