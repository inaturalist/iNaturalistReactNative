import { StyleSheet } from "react-native";

import colors from "./tailwindColors";

export const getShadowStyle = ( {
  shadowColor,
  offsetWidth,
  offsetHeight,
  shadowOpacity,
  shadowRadius,
  elevation
} ) => StyleSheet.create( {
  shadowColor,
  shadowOffset: {
    width: offsetWidth,
    height: offsetHeight
  },
  // $FlowIssue[incompatible-shape]
  shadowOpacity,
  // $FlowIssue[incompatible-shape]
  shadowRadius,
  // $FlowIssue[incompatible-shape]
  elevation
} );

export const dropShadow = getShadowStyle( {
  shadowColor: colors.black,
  offsetWidth: 0,
  offsetHeight: 2,
  shadowRadius: 2,
  shadowOpacity: 0.25,
  elevation: 5
} );
