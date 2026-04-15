// Trying to consolidate cleanup and nav logic when exiting the obs create /
// edit flow, so basically nav to MyObs by default and clean up the zustand
// state
import { useNavigation, useRoute } from "@react-navigation/native";
import navigateToObsDetails from "components/ObsDetails/helpers/navigateToObsDetails";
import type { NoBottomTabStackScreenProps, TabStackScreenProps } from "navigation/types";
import { useCallback } from "react";
import useStore from "stores/useStore";

interface ExitOptions {
  skipStoreReset?: boolean;
}
interface Options {
  navigate?: ( ) => void;
}

export default function useExitObservationFlow( exitOptions?: ExitOptions ) {
  // This hook is used in:
  // - useBackPress.ts
  // - MatchContainer.js
  const navigation = useNavigation<
    NoBottomTabStackScreenProps<"Camera">["navigation"] &
    TabStackScreenProps<"Match">["navigation"]
  >( );
  const { params } = useRoute<NoBottomTabStackScreenProps<"Camera">["route"]>( );
  const resetObservationFlowSlice = useStore( state => state.resetObservationFlowSlice );

  return useCallback( ( options: Options = {} ) => {
    // In theory everything that needs to be saved has been saved at this
    // point, so clean up the state before we ditch this posicle stand. Note
    // that for mysterious reasons, tests seem to like it better if we do
    // this before navigating
    if ( !exitOptions?.skipStoreReset ) {
      // want a skip option because on MatchContainer this is causing the whole component
      // to rerender with no currentObservation, which means useSuggestions crashes from
      // having no photo passed in, and many parts of the UI also result in crashes
      resetObservationFlowSlice( );
    }

    const previousScreen = params && params.previousScreen
      ? params.previousScreen
      : null;
    if ( previousScreen && previousScreen.name === "ObsDetails" ) {
      navigateToObsDetails( navigation, previousScreen.params.uuid );
    } else if ( typeof ( options.navigate ) === "function" ) {
      options.navigate();
    } else {
      navigation.navigate( "TabNavigator", {
        screen: "ObservationsTab",
        params: {
          screen: "ObsList",
        },
      } );
    }
  }, [
    navigation,
    params,
    resetObservationFlowSlice,
    exitOptions,
  ] );
}
