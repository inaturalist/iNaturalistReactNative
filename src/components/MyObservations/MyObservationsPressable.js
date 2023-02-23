// @flow

import { useNavigation } from "@react-navigation/native";
import type { Node } from "react";
import React from "react";
import { useTranslation } from "react-i18next";
import { Pressable } from "react-native";

type Props = {
  observation: Object,
  children: any
}

const MyObservationsPressable = ( { observation, children }: Props ): Node => {
  const navigation = useNavigation( );
  const { t } = useTranslation( );
  const unsynced = !observation.wasSynced( );

  const navigateToObservation = async ( ) => {
    const { uuid } = observation;
    if ( unsynced ) {
      navigation.navigate( "ObsEdit", { uuid } );
    } else {
      navigation.navigate( "ObsDetails", { uuid } );
    }
  };

  return (
    <Pressable
      onPress={( ) => navigateToObservation( )}
      accessibilityRole="link"
      accessibilityHint={unsynced
        ? t( "Navigate-to-observation-edit-screen" )
        : t( "Navigate-to-observation-details" )}
      accessibilityLabel={t( "Observation-Name", {
        scientificName: observation.name
      } )}
    >
      {children}
    </Pressable>
  );
};

export default MyObservationsPressable;
