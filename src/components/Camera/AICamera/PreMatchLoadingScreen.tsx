import { ActivityIndicator, Body1, INatIconButton } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useEffect, useRef, useState } from "react";
import { Animated } from "react-native";
import { useTranslation } from "sharedHooks";
import colors from "styles/tailwindColors";

interface Props {
  takingPhoto: boolean
}

const fade = value => ( {
  toValue: value,
  duration: 100,
  useNativeDriver: true
} );

const PreMatchLoadingScreen = ( { takingPhoto }: Props ): Node => {
  const [showLoading, setShowLoading] = useState( false );
  const fadeAnimation = useRef( new Animated.Value( 0 ) ).current;
  const { t } = useTranslation( );

  useEffect( ( ) => {
    if ( takingPhoto ) {
      setShowLoading( true );
      Animated.sequence( [
        // fade screen out to partial opacity and don't fade back in for pre-match loading screen
        Animated.timing( fadeAnimation, fade( 0.8 ) )
      ] ).start( );
    }
  }, [takingPhoto, fadeAnimation] );

  const navigateToMatch = ( ) => console.log( "navigate to match screen" );

  const animatedStyle = {
    zIndex: 1000,
    position: "absolute",
    height: "100%",
    width: "100%",
    backgroundColor: colors.black,
    opacity: fadeAnimation
  };

  return (
    <Animated.View
      pointerEvents="none"
      style={animatedStyle}
    >
      {showLoading && (
        <>
          <View className="absolute right-5 top-10 text-white underline">
            <INatIconButton
              onPress={navigateToMatch}
              accessibilityLabel={t( "Skip-additional-suggestions" )}
              accessibilityHint={t( "Navigates-to-match-screen" )}
              icon="skip"
              color={colors.white}
              size={20}
            />
          </View>
          <View className="flex-1 items-center justify-center">
            <Body1 className="text-white">
              {t( "Getting-an-even-more-accurate-ID" )}
            </Body1>
            <Body1 className="text-white mt-2 mb-[29px]">
              {t( "This-may-take-a-few-seconds" )}
            </Body1>
            <ActivityIndicator
              size={50}
              color={colors.white}
            />
          </View>
        </>
      )}
    </Animated.View>
  );
};

export default PreMatchLoadingScreen;
