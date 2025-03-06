import {
  ActivityIndicator, Body1, INatIconButton
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import React, { useEffect, useRef } from "react";
import { Animated, ViewStyle } from "react-native";
import { useTranslation } from "sharedHooks";
import colors from "styles/tailwindColors";

const fade = ( value: number ) => ( {
  toValue: value,
  duration: 100,
  useNativeDriver: true
} );

interface Props {
  isLoading: boolean;
  onSkip: ( ) => void;
}

const PreMatchLoadingScreen = ( { isLoading, onSkip }: Props ) => {
  const fadeAnimation = useRef( new Animated.Value( 0 ) ).current;
  const { t } = useTranslation( );

  useEffect( ( ) => {
    if ( isLoading ) {
      Animated.sequence( [
        // fade screen out to partial opacity and don't fade back in for pre-match loading screen
        Animated.timing( fadeAnimation, fade( 0.8 ) )
      ] ).start( );
    }
  }, [isLoading, fadeAnimation] );

  const animatedStyle: ViewStyle = {
    position: "absolute",
    height: "100%",
    width: "100%",
    backgroundColor: colors.black,
    opacity: fadeAnimation,
    zIndex: 999
  };

  const viewStyle: ViewStyle = {
    position: "absolute",
    height: "100%",
    width: "100%",
    zIndex: 1000
  };

  if ( !isLoading ) {
    return null;
  }

  return (
    <>
      <Animated.View style={animatedStyle} />
      <View style={viewStyle}>
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
        <View
          className="absolute right-5 top-10 text-white"
        >
          <INatIconButton
            onPress={onSkip}
            accessibilityLabel={t( "Skip-additional-suggestions" )}
            accessibilityHint={t( "Navigates-to-match-screen" )}
            icon="skip"
            color={colors.white}
            size={20}
          />
        </View>
      </View>
    </>
  );
};

export default PreMatchLoadingScreen;
