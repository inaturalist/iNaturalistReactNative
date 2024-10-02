// @flow

import { Heading2, INatIconButton } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { useTranslation } from "sharedHooks";

type Props = {
  currentObservationIndex: number,
  setCurrentObservationIndex: Function,
  observations: Array<Object>,
  setResetScreen: Function
}

const MultipleObservationsArrows = ( {
  currentObservationIndex,
  setCurrentObservationIndex,
  observations,
  setResetScreen
}: Props ): Node => {
  const { t } = useTranslation( );

  const showNextObservation = ( ) => {
    setCurrentObservationIndex( currentObservationIndex + 1 );
    setResetScreen( true );
  };
  const showPrevObservation = ( ) => {
    setCurrentObservationIndex( currentObservationIndex - 1 );
    setResetScreen( true );
  };

  return (
    <View className="flex-row items-center justify-between py-5 mx-3">
      <View className="w-16">
        {currentObservationIndex !== 0 && (
          <INatIconButton
            icon="chevron-left-circle"
            size={26}
            onPress={showPrevObservation}
            accessibilityLabel={t( "Previous-observation" )}
          />
        )}
      </View>
      <Heading2>
        {t( "X-of-Y", {
          x: currentObservationIndex + 1,
          y: observations.length
        } )}
      </Heading2>
      <View className="w-16 flex items-end">
        {( currentObservationIndex !== observations.length - 1 )
          && (
            <INatIconButton
              icon="chevron-right-circle"
              size={26}
              onPress={showNextObservation}
              accessibilityLabel={t( "Next-observation" )}
            />
          )}
      </View>
    </View>
  );
};

export default MultipleObservationsArrows;
