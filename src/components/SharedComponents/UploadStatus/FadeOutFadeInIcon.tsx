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
  const checkmarkOpacity = useSharedValue( 0 );
  const statusOpacity = useSharedValue( 0 );

  useEffect( ( ) => {
    checkmarkOpacity.value = withSequence(
      withTiming( 1, { duration: 800 } ),
      withDelay( 700, withTiming( 0, { duration: 500 } ) ),
    );
    statusOpacity.value = withDelay( 1500, withTiming( 1, { duration: 800 } ) );
  }, [checkmarkOpacity, statusOpacity] );

  const checkmarkStyle = useAnimatedStyle( ( ) => ( { opacity: checkmarkOpacity.value } ) );
  const statusStyle = useAnimatedStyle( ( ) => ( { opacity: statusOpacity.value } ) );

  return (
    <View>
      <AnimatedView
        className="absolute h-full justify-center"
        style={checkmarkStyle}
        testID={`UploadIcon.complete.${uniqueKey}`}
      >
        {fadeOutIcon}
      </AnimatedView>
      <AnimatedView style={statusStyle}>
        {fadeInIcon}
      </AnimatedView>
    </View>
  );
};
export default FadeOutFadeInIcon;
