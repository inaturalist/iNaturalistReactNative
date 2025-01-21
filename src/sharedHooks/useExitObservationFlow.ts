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

  return useCallback( ( options: Options = {} ) => {
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
    params
  ] );
}
