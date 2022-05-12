// @flow strict-local

import { StyleSheet, Dimensions } from "react-native";

import type { ImageStyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";

const { width, height } = Dimensions.get( "screen" );

const imageStyles: { [string]: ImageStyleProp } = StyleSheet.create( {
  selectedPhoto: {
    width: width,
    height: height - 300
  }
} );

export {
  imageStyles
};
