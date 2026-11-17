import { Heading2, INatIconButton } from "components/SharedComponents";
import { View } from "components/styledComponents";
import React from "react";
import { Animated } from "react-native";
import { useTranslation } from "sharedHooks";

interface Props {
  currentObservationIndex: number;
  setCurrentObservationIndex: ( index: number ) => void;
  // Only the length is read
  observations: object[];
  setResetScreen: ( resetScreen: boolean ) => void;
  transitionAnimation: ( ) => void;
  transitionAnimationRef: Animated.Value;
}

const MultipleObservationsArrows = ( {
  currentObservationIndex,
  setCurrentObservationIndex,
  observations,
  setResetScreen,
  transitionAnimation,
  transitionAnimationRef,
}: Props ) => {
  const { t } = useTranslation( );

  const animatedStyle = {
    opacity: transitionAnimationRef, // Bind opacity to animated value
  };

  const showNextObservation = ( ) => {
    setCurrentObservationIndex( currentObservationIndex + 1 );
    setResetScreen( true );
    transitionAnimation();
  };
  const showPrevObservation = ( ) => {
    setCurrentObservationIndex( currentObservationIndex - 1 );
    setResetScreen( true );
    transitionAnimation();
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
      <Animated.View style={animatedStyle}>
        <Heading2>
          {t( "X-of-Y", {
            x: currentObservationIndex + 1,
            y: observations.length,
          } )}
        </Heading2>
      </Animated.View>
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
