// @flow

import { Heading2 } from "components/SharedComponents";
import { View } from "components/styledComponents";
import { t } from "i18next";
import { ObsEditContext } from "providers/contexts";
import type { Node } from "react";
import React, { useContext } from "react";
import { IconButton } from "react-native-paper";

const MultipleObservationsArrows = ( ): Node => {
  const {
    currentObservationIndex,
    setCurrentObservationIndex,
    observations
  } = useContext( ObsEditContext );

  const showNextObservation = ( ) => setCurrentObservationIndex( currentObservationIndex + 1 );
  const showPrevObservation = ( ) => setCurrentObservationIndex( currentObservationIndex - 1 );

  return (
    <View className="flex-row items-center justify-between pt-5">
      <View className="w-16">
        {currentObservationIndex !== 0 && (
          <IconButton
            icon="chevron-left-circle"
            size={26}
            onPress={showPrevObservation}
          />
        )}
      </View>
      <Heading2>
        {t( "X-of-Y", {
          count: currentObservationIndex + 1,
          totalObservationCount: observations.length
        } )}
      </Heading2>
      <View className="w-16">
        {( currentObservationIndex !== observations.length - 1 )
          && (
            <IconButton
              icon="chevron-right-circle"
              size={26}
              onPress={showNextObservation}
            />
          )}
      </View>
    </View>
  );
};

export default MultipleObservationsArrows;
