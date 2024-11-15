// Trying to consolidate cleanup and nav logic when exiting the obs create /
// edit flow, so basically nav to MyObs by default and clean up the zustand
// state
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import navigateToObsDetails from "components/ObsDetails/helpers/navigateToObsDetails";
import { useCallback } from "react";
import useStore from "stores/useStore";

interface ObsFlowParams {
  [name: string]: {
    previousScreen?: {
      name: string;
      params: {
        uuid?: string
      }
    }
  }
}

interface Options {
  navigate?: ( ) => void;
}

export default function useExitObservationFlow( ) {
  const navigation = useNavigation( );
  const { params } = useRoute<RouteProp<ObsFlowParams, string>>( );
  const resetObservationFlowSlice = useStore( state => state.resetObservationFlowSlice );

  return useCallback( ( options: Options = {} ) => {
    // In theory everything that needs to be saved has been saved at this
    // point, so clean up the state before we ditch this posicle stand. Note
    // that for mysterious reasons, tests seem to like it better if we do
    // this before navigating
    resetObservationFlowSlice( );

    const previousScreen = params && params.previousScreen
      ? params.previousScreen
      : null;
    if ( previousScreen && previousScreen.name === "ObsDetails" ) {
      navigateToObsDetails( navigation, previousScreen.params.uuid );
    } else if ( typeof ( options.navigate ) === "function" ) {
      options.navigate();
    } else {
      navigation.navigate( "TabNavigator", {
        screen: "TabStackNavigator",
        params: {
          screen: "ObsList"
        }
      } );
    }
  }, [
    navigation,
    params,
    resetObservationFlowSlice
  ] );
}
