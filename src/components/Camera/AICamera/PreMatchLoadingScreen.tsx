import { ActivityIndicator, Body1 } from "components/SharedComponents";
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
        // fade screen out to black, but don't fade back in for pre-match loading screen
        Animated.timing( fadeAnimation, fade( 1 ) )
      ] ).start( );
    }
  }, [takingPhoto, fadeAnimation] );

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
          <Body1 className="absolute right-10 top-20 text-white underline">
            {t( "Skip" )}
          </Body1>
          <View className="flex-1 items-center justify-center">
            <Body1 className="text-white">
              {t( "Getting-an-even-more-accurate-ID" )}
            </Body1>
            <Body1 className="text-white mt-5 mb-10">
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
