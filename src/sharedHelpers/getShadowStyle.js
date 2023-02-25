import { StyleSheet } from "react-native";

const getShadowStyle = ( {
  shadowColor,
  offsetWidth,
  offsetHeight,
  opacity,
  radius,
  elevation = 5
} ) => StyleSheet.create( {
  shadowColor,
  shadowOffset: {
    width: offsetWidth,
    height: offsetHeight
  },
  // $FlowIssue[incompatible-shape]
  shadowOpacity: opacity,
  // $FlowIssue[incompatible-shape]
  shadowRadius: radius,
  // $FlowIssue[incompatible-shape]
  elevation
} );

export default getShadowStyle;
