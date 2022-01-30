// @flow strict-local

import { StyleSheet, Dimensions } from "react-native";

import type { ImageStyleProp, TextStyleProp, ViewStyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";

const { width } = Dimensions.get( "screen" );

const imageWidth = width / 4;

const viewStyles: { [string]: ViewStyleProp } = StyleSheet.create( {
  gridItem: {
    width: imageWidth
  }
} );

const textStyles: { [string]: TextStyleProp } = StyleSheet.create( {
  text: { }
} );

const imageStyles: { [string]: ImageStyleProp } = StyleSheet.create( {
  gridImage: {
    width: imageWidth,
    height: imageWidth
  }
} );

export {
  imageStyles,
  textStyles,
  viewStyles
};
