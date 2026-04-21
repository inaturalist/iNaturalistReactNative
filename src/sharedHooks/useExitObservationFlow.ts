// Trying to consolidate cleanup and nav logic when exiting the obs create /
// edit flow, so basically nav to MyObs by default and clean up the zustand
// state
import { CommonActions, useNavigation } from "@react-navigation/native";
import type { NoBottomTabStackScreenProps, TabStackScreenProps } from "navigation/types";
import { useCallback } from "react";
import { clearRollbackPhotos } from "sharedHelpers/clearCaches";
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
  // - BottomButtonsContainer.tsx
  // - ObsEditHeader.js
  // - PhotoLibrary.tsx
  // - TaxonDetails.tsx
  const navigation = useNavigation<
    NoBottomTabStackScreenProps<
      "Match" | "Camera" | "ObsEdit" | "PhotoLibrary" | "TaxonDetails"
    >["navigation"] &
    TabStackScreenProps<"Match" | "ObsEdit" | "TaxonDetails">["navigation"]
  >( );
  const resetObservationFlowSlice = useStore( state => state.resetObservationFlowSlice );
  const clearRollbackSnapshot = useStore( state => state.clearRollbackSnapshot );

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
    } else {
      // Even when skipping the full reset (e.g. MatchContainer), clear the
      // rollback snapshot since leaving the flow means rollback is no longer relevant
      clearRollbackSnapshot( );
    }
    void clearRollbackPhotos( );

    if ( typeof ( options.navigate ) === "function" ) {
      // This seems only to be used in ObsEditHeader in a few cases of backing out
      options.navigate( );
    } else {
      // Use a reset (not navigate) to avoid piling up screen instances
      navigation.dispatch(
        CommonActions.reset( {
          index: 0,
          routes: [
            {
              name: "TabNavigator",
              state: {
                routes: [
                  {
                    name: "ObservationsTab",
                    state: {
                      index: 0,
                      routes: [
                        { name: "ObsList" },
                      ],
                    },
                  },
                ],
              },
            },
          ],
        } ),
      );
    }
  }, [
    clearRollbackSnapshot,
    navigation,
    resetObservationFlowSlice,
    exitOptions,
  ] );
}
