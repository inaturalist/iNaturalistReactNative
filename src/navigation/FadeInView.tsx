import {
  useFocusEffect
} from "@react-navigation/native";
import * as React from "react";
import { Animated } from "react-native";

interface Props {
  children: React.JSX.Element;
}

const FadeInView = ( { children }: Props ) => {
  const fadeAnim = React.useRef( new Animated.Value( 0 ) ).current; // Initial value for opacity: 0

  useFocusEffect( () => {
    Animated.timing( fadeAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true
    } ).start();
    return () => {
      Animated.timing( fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true
      } ).start();
    };
  } );

  const animatedStyle = {
    flex: 1,
    opacity: fadeAnim // Bind opacity to animated value
  };

  return (
    <Animated.View // Special animatable View
      style={animatedStyle}
    >
      {children}
    </Animated.View>
  );
};

export default FadeInView;
