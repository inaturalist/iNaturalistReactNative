import classnames from "classnames";
import { INatIcon } from "components/SharedComponents";
import { View } from "components/styledComponents";
import React, { useCallback, useEffect } from "react";
import Reanimated, {
  Easing, interpolate,
  useAnimatedStyle, useDerivedValue, useSharedValue, withRepeat,
  withTiming
} from "react-native-reanimated";

type Props = {
  iconClasses: Array<string>;
  color: string;
  showProgressArrow: React.JSX.Element;
}
const AnimatedView = Reanimated.createAnimatedComponent( View );

const UploadQueuedRotatingIcon = ( {
  showProgressArrow,
  iconClasses,
  color
}: Props ) => {
  const animation = useSharedValue( 0 );
  const rotation = useDerivedValue( ( ) => interpolate(
    animation.value,
    [0, 1],
    [0, 360]
  ) );
  const rotate = useAnimatedStyle( ( ) => ( {
    transform: [
      {
        rotateZ: `${rotation.value}deg`
      }
    ]
  } ), [rotation.value] );

  const startAnimation = useCallback( ( ) => {
    animation.value = withRepeat(
      withTiming( 1, {
        duration: 10000,
        easing: Easing.linear
      } ),
      -1
    );
  }, [animation] );

  useEffect( ( ) => {
    startAnimation( );
  }, [startAnimation] );

  return (
    <View className={classnames( iconClasses )}>
      {showProgressArrow( )}
      <AnimatedView style={rotate}>
        <INatIcon name="circle-dots" color={color} size={33} />
      </AnimatedView>
    </View>
  );
};
export default UploadQueuedRotatingIcon;
