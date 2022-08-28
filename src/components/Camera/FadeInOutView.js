// @flow strict-local

import type { Node } from "react";
import React, { useEffect, useRef } from "react";
import { Animated } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import viewStyles from "../../styles/camera/fadeInOutView";

type Props = {
  savingPhoto: boolean
}

const fade = value => ( {
  toValue: value,
  duration: 100,
  useNativeDriver: true
} );

const FadeInOutView = ( { savingPhoto }: Props ): Node => {
  const fadeAnimation = useRef( new Animated.Value( 0 ) ).current;

  const insets = useSafeAreaInsets( );

  useEffect( ( ) => {
    if ( savingPhoto ) {
      Animated.sequence( [
        Animated.timing( fadeAnimation, fade( 1 ) ),
        Animated.timing( fadeAnimation, fade( 0 ) )
      ] ).start( );
    }
  }, [savingPhoto, fadeAnimation] );

  // $FlowIgnore
  const bottomOfPhotoPreview = viewStyles.bottomOfPhotoPreview.height + insets.top;

  return (
    <Animated.View
      style={[
        viewStyles.fadingContainer,
        {
          top: bottomOfPhotoPreview,
          // $FlowIgnore
          height: viewStyles.fadingContainer.height - bottomOfPhotoPreview,
          opacity: fadeAnimation
        }
      ]}
    />
  );
};

export default FadeInOutView;
