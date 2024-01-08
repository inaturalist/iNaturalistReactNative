// @flow

import { useNavigation } from "@react-navigation/native";
import type { Node } from "react";
import React from "react";
import { Pressable } from "react-native";
import { useTranslation } from "sharedHooks";
import useStore from "stores/useStore";

type Props = {
  observation: Object,
  testID?: string,
  children: any
}

const MyObservationsPressable = ( { observation, testID, children }: Props ): Node => {
  const navigation = useNavigation( );
  const { t } = useTranslation( );
  const setObservations = useStore( state => state.setObservations );

  const unsynced = typeof observation.wasSynced !== "undefined" && !observation.wasSynced( );

  const navigateToObservation = ( ) => {
    const { uuid } = observation;
    if ( unsynced ) {
      setObservations( [observation] );
      navigation.navigate( "ObsEdit" );
    } else {
      navigation.navigate( "ObsDetails", { uuid } );
    }
  };

  return (
    <Pressable
      testID={testID}
      onPress={navigateToObservation}
      accessibilityRole="link"
      accessibilityHint={unsynced
        ? t( "Navigate-to-observation-edit-screen" )
        : t( "Navigate-to-observation-details" )}
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
