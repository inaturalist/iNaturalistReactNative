// @flow strict-local

import { Dimensions, StyleSheet } from "react-native";
import type { ImageStyleProp, TextStyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";
import colors from "styles/colors";

const { width } = Dimensions.get( "screen" );

const textStyles: { [string]: TextStyleProp } = StyleSheet.create( {
  license: {
    color: colors.white,
    position: "absolute",
    right: 10,
    bottom: 10
  }
} );

const imageStyles: { [string]: ImageStyleProp } = StyleSheet.create( {
  fullWidthImage: {
    width,
    height: 200,
    resizeMode: "contain"
  }
} );

export {
  imageStyles,
  textStyles
};
