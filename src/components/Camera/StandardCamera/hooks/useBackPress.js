// @flow

import { useFocusEffect, useNavigation } from "@react-navigation/native";
import {
  useCallback,
  useState
} from "react";
import {
  BackHandler
} from "react-native";
import useStore from "stores/useStore";

const useBackPress = ( backToObsEdit: ?boolean ): Object => {
  const [showDiscardSheet, setShowDiscardSheet] = useState( false );
  const navigation = useNavigation( );
  const cameraPreviewUris = useStore( state => state.cameraPreviewUris );

  const handleBackButtonPress = useCallback( ( ) => {
    if ( cameraPreviewUris.length > 0 ) {
      setShowDiscardSheet( true );
    } else if ( backToObsEdit ) {
      navigation.navigate( "ObsEdit" );
    } else {
      navigation.goBack( );
    }
  }, [backToObsEdit, setShowDiscardSheet, cameraPreviewUris, navigation] );

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
