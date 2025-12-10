import { ActivityIndicator } from "components/SharedComponents";
import React, { useEffect, useRef } from "react";
import { Animated } from "react-native";
import colors from "styles/tailwindColors";

interface Props {
  takingPhoto: boolean;
  cameraType: string;
}

const fade = value => ( {
  toValue: value,
  duration: 100,
  useNativeDriver: true
} );

const FadeInOutView = ( { takingPhoto, cameraType }: Props ) => {
  const fadeAnimation = useRef( new Animated.Value( 0 ) ).current;

  useEffect( ( ) => {
    if ( takingPhoto ) {
      Animated.sequence( [
        Animated.timing( fadeAnimation, fade( 1 ) ),
        Animated.timing( fadeAnimation, fade( 0 ) )
      ] ).start( );
    }
  }, [takingPhoto, fadeAnimation] );

  return (
    <>
      <Animated.View
        pointerEvents="none"
        className="items-center justify-center"
        // eslint-disable-next-line react-native/no-inline-styles
        style={{
          position: "absolute",
          height: "100%",
          width: "100%",
          backgroundColor: colors.black,
          opacity: fadeAnimation
        }}
      />
      {( takingPhoto && cameraType === "AI" ) && (
        <ActivityIndicator
          size={50}
          color={colors.white}
        />
      )}
    </>
  );
};

export default FadeInOutView;
