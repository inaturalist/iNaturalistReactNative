// @flow strict-local

import { StyleSheet, Dimensions } from "react-native";

import type { TextStyleProp, ImageStyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";
import colors from "../colors";

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
  textStyles,
  imageStyles
};
