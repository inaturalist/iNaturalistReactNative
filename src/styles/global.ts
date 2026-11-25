import type { ViewStyle } from "react-native";

interface ShadowOptions {
  elevation: number;
  offsetHeight: number;
  offsetWidth: number;
  shadowColor: string;
  shadowOpacity: number;
  shadowRadius: number;
}

const DEFAULT_SHADOW: ShadowOptions = {
  elevation: 5,
  offsetHeight: 2,
  offsetWidth: 0,
  shadowColor: "rgba( 0, 0, 0, 0.25 )",
  shadowOpacity: 0.25,
  shadowRadius: 2,
};

// https://reactnative.dev/docs/shadow-props
export const getShadowStyle = ( {
  shadowColor,
  offsetWidth,
  offsetHeight,
  shadowOpacity,
  shadowRadius,
  elevation,
}: ShadowOptions ): ViewStyle => ( {
  // iOS + Android >= 28
  shadowColor,

  // iOS-only
  shadowOffset: {
    width: offsetWidth,
    height: offsetHeight,
  },
  shadowOpacity,
  shadowRadius,

  // Android-only
  elevation,
} );

export const dropShadow = getShadowStyle( DEFAULT_SHADOW );

export function getShadow( options: Partial<ShadowOptions> = {} ) {
  return getShadowStyle( {
    ...DEFAULT_SHADOW,
    ...options,
  } );
}
