import { View } from "components/styledComponents";
import type { ReactNode } from "react";
import React, { useEffect } from "react";
import Reanimated, {
  useAnimatedStyle, useSharedValue, withDelay, withSequence, withTiming,
} from "react-native-reanimated";

interface Props {
  fadeInIcon: ReactNode;
  fadeOutIcon: ReactNode;
  uniqueKey: string;
}
const AnimatedView = Reanimated.createAnimatedComponent( View );

const FadeOutFadeInIcon = ( {
  fadeInIcon,
  fadeOutIcon,
  uniqueKey,
}: Props ) => {
  const fadeOutOpacity = useSharedValue( 0 );
  const fadeInOpacity = useSharedValue( 0 );

  useEffect( ( ) => {
    fadeOutOpacity.value = withSequence(
      withTiming( 1, { duration: 800 } ),
      withDelay( 700, withTiming( 0, { duration: 500 } ) ),
    );
    fadeInOpacity.value = withDelay( 1500, withTiming( 1, { duration: 800 } ) );
  }, [fadeOutOpacity, fadeInOpacity] );

  const fadeOutStyle = useAnimatedStyle( ( ) => ( { opacity: fadeOutOpacity.value } ) );
  const fadeInStyle = useAnimatedStyle( ( ) => ( { opacity: fadeInOpacity.value } ) );

  return (
    <View>
      <AnimatedView
        className="absolute h-full justify-center"
        style={fadeOutStyle}
        testID={`UploadIcon.complete.${uniqueKey}`}
      >
        {fadeOutIcon}
      </AnimatedView>
      <AnimatedView style={fadeInStyle}>
        {fadeInIcon}
      </AnimatedView>
    </View>
  );
};
export default FadeOutFadeInIcon;
