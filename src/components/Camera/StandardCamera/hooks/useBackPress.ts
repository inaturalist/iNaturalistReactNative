import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import navigateToObsDetails from "components/ObsDetails/helpers/navigateToObsDetails";
import { getCurrentRoute } from "navigation/navigationUtils.ts";
import {
  useCallback,
  useState
} from "react";
import {
  BackHandler
} from "react-native";

const useBackPress = ( shouldShowDiscardSheet: boolean ) => {
  const navigation = useNavigation( );
  const { params } = useRoute();

  const [showDiscardSheet, setShowDiscardSheet] = useState( false );

  const handleBackButtonPress = useCallback( ( ) => {
    if ( shouldShowDiscardSheet ) {
      setShowDiscardSheet( true );
    } else {
      const currentRoute = getCurrentRoute();
      if ( currentRoute?.params?.addEvidence ) {
        navigation.navigate( "ObsEdit" );
      } else {
        const previousScreen = params && params.previousScreen
          ? params.previousScreen
          : null;

        if ( previousScreen && previousScreen.name === "ObsDetails" ) {
          navigateToObsDetails( navigation, previousScreen.params.uuid );
        } else {
          navigation.navigate( "TabNavigator", {
            screen: "TabStackNavigator",
            params: {
              screen: "ObsList"
            }
          } );
        }
      }
    }
  }, [shouldShowDiscardSheet, setShowDiscardSheet, navigation, params] );

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
