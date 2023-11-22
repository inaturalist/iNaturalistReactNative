// @flow

import { Heading2, INatIconButton } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { useTranslation } from "sharedHooks";

type Props = {
  currentObservationIndex: number,
  setCurrentObservationIndex: Function,
  observations: Array<Object>
}

const MultipleObservationsArrows = ( {
  currentObservationIndex,
  setCurrentObservationIndex,
  observations
}: Props ): Node => {
  const { t } = useTranslation( );

  const showNextObservation = ( ) => setCurrentObservationIndex( currentObservationIndex + 1 );
  const showPrevObservation = ( ) => setCurrentObservationIndex( currentObservationIndex - 1 );

  return (
    <View className="flex-row items-center justify-between pt-5">
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
          count: currentObservationIndex + 1,
          totalObservationCount: observations.length
        } )}
      </Heading2>
      <View className="w-16">
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
