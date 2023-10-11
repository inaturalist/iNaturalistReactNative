import { StyleSheet } from "react-native";

import colors from "./tailwindColors";

// https://reactnative.dev/docs/shadow-props
export const getShadowStyle = ( {
  shadowColor,
  offsetWidth,
  offsetHeight,
  shadowOpacity,
  shadowRadius,
  elevation
} ) => StyleSheet.create( {
  // iOS + Android >= 28
  shadowColor,

  // iOS-only
  shadowOffset: {
    width: offsetWidth,
    height: offsetHeight
  },
  // $FlowIssue[incompatible-shape]
  shadowOpacity,
  // $FlowIssue[incompatible-shape]
  shadowRadius,

  // Android-only
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

export function getShadowForColor( shadowColor, options = {} ) {
  return getShadowStyle( {
    shadowColor,
    offsetWidth: 0,
    offsetHeight: 2,
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 5,
    ...options
  } );
}
