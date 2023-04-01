// @flow

import { Heading2 } from "components/SharedComponents";
import { Pressable, View } from "components/styledComponents";
import { t } from "i18next";
import { ObsEditContext } from "providers/contexts";
import type { Node } from "react";
import React, { useContext } from "react";
import Icon from "react-native-vector-icons/MaterialIcons";

const ObsEditHeaderTitle = ( ): Node => {
  const {
    currentObservationIndex,
    setCurrentObservationIndex,
    observations
  } = useContext( ObsEditContext );

  const showNextObservation = ( ) => setCurrentObservationIndex( currentObservationIndex + 1 );
  const showPrevObservation = ( ) => setCurrentObservationIndex( currentObservationIndex - 1 );

  // prevent header from flickering if observations haven't loaded yet
  if ( observations.length === 0 ) {
    return null;
  }

  return observations.length === 1
    ? (
      <Heading2
        testID="new-observation-text"
        accessible
        accessibilityRole="header"
      >
        {t( "New-Observation" )}
      </Heading2>
    )
    : (
      <View className="flex-row items-center">
        <Pressable accessibilityRole="button" onPress={showPrevObservation} className="w-16">
          {currentObservationIndex !== 0 && <Icon name="keyboard-arrow-left" size={30} />}
        </Pressable>
        <Heading2>
          {`${currentObservationIndex + 1} of ${observations.length}`}
        </Heading2>
        <Pressable accessibilityRole="button" onPress={showNextObservation} className="w-16">
          {( currentObservationIndex !== observations.length - 1 )
            && <Icon name="keyboard-arrow-right" size={30} />}
        </Pressable>
      </View>
    );
};

export default ObsEditHeaderTitle;
