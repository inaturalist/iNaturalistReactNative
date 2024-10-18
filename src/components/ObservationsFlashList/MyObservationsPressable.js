// @flow

import { useNavigation } from "@react-navigation/native";
import navigateToObsEdit from "components/ObsEdit/helpers/navigateToObsEdit.ts";
import { getCurrentRoute } from "navigation/navigationUtils.ts";
import type { Node } from "react";
import React from "react";
import { Pressable } from "react-native";
import { useTranslation } from "sharedHooks";
import useStore from "stores/useStore";

type Props = {
  observation: Object,
  testID?: string,
  // $FlowIgnore
  children: unknown
}

const MyObservationsPressable = ( { observation, testID, children }: Props ): Node => {
  const navigation = useNavigation( );
  const { t } = useTranslation( );
  const prepareObsEdit = useStore( state => state.prepareObsEdit );
  const setMyObsOffsetToRestore = useStore( state => state.setMyObsOffsetToRestore );

  const unsynced = typeof observation.wasSynced !== "undefined" && !observation.wasSynced( );

  const navigateToObservation = ( ) => {
    const { uuid } = observation;
    if ( unsynced ) {
      prepareObsEdit( observation );
      navigateToObsEdit( navigation, setMyObsOffsetToRestore );
    } else {
      const currentRoute = getCurrentRoute();
      const uniqueKey = currentRoute?.key || "key-default";
      navigation.navigate( {
        key: `Obs-${uniqueKey}-${uuid}`,
        name: "ObsDetails",
        params: { uuid }
      } );
    }
  };

  return (
    <Pressable
      testID={testID}
      onPress={navigateToObservation}
      accessibilityRole="link"
      accessibilityHint={unsynced
        ? t( "Navigates-to-observation-edit-screen" )
        : t( "Navigates-to-observation-details" )}
      accessibilityLabel={t( "Observation-Name", {
        // TODO: use the name that the user prefers (common or scientific)
        scientificName: observation.species_guess
      } )}
    >
      {children}
    </Pressable>
  );
};

export default MyObservationsPressable;
