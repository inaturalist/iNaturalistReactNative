import { StyleSheet } from "react-native";

import colors from "./tailwindColors";

const DEFAULT_SHADOW = {
  elevation: 5,
  offsetHeight: 2,
  offsetWidth: 0,
  shadowColor: colors.black,
  shadowOpacity: 0.25,
  shadowRadius: 2
};

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

export const dropShadow = getShadowStyle( DEFAULT_SHADOW );

export function getShadowForColor( shadowColor, options = {} ) {
  return getShadowStyle( {
    ...DEFAULT_SHADOW,
    shadowColor,
    ...options
  } );
}
