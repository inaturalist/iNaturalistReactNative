import {
  useFocusEffect,
} from "@react-navigation/native";
import * as React from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface Props {
  children: React.JSX.Element;
}

const FadeInView = ({ children }: Props) => {
  const opacity = useSharedValue(0);

  useFocusEffect(() => {
    opacity.set(withTiming(1, { duration: 250 }));
    return () => {
      opacity.set(withTiming(0, { duration: 250 }));
    };
  });

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      className="flex-1"
      style={animatedStyle}
    >
      {children}
    </Animated.View>
  );
};

export default FadeInView;
