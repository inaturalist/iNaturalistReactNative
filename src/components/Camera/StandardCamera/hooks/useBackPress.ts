import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { getCurrentRoute } from "navigation/navigationUtils";
import {
  useCallback,
  useState
} from "react";
import {
  BackHandler
} from "react-native";
import useExitObservationFlow from "sharedHooks/useExitObservationFlow";

const useBackPress = ( shouldShowDiscardSheet: boolean ) => {
  const navigation = useNavigation( );
  const exitObservationFlow = useExitObservationFlow( );

  const [showDiscardSheet, setShowDiscardSheet] = useState( false );

  const handleBackButtonPress = useCallback( ( ) => {
    if ( shouldShowDiscardSheet ) {
      setShowDiscardSheet( true );
    } else {
      const currentRoute = getCurrentRoute();
      if ( currentRoute?.params?.addEvidence ) {
        navigation.navigate( "ObsEdit" );
      } else {
        exitObservationFlow( );
      }
    }
  }, [
    exitObservationFlow,
    navigation,
    setShowDiscardSheet,
    shouldShowDiscardSheet
  ] );

  useFocusEffect(
    // note: cannot use navigation.addListener to trigger bottom sheet in tab navigator
    // since the screen is unfocused, not removed from navigation
    useCallback( ( ) => {
      // make sure an Android user cannot back out and accidentally discard photos
      const onBackPress = ( ) => {
        handleBackButtonPress( );
        return true;
      };

      const backHandler = BackHandler.addEventListener( "hardwareBackPress", onBackPress );

      return ( ) => backHandler.remove( );
    }, [handleBackButtonPress] )
  );

  return {
    handleBackButtonPress,
    setShowDiscardSheet,
    showDiscardSheet
  };
};

export default useBackPress;
