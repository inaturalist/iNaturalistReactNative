// @flow strict-local

import { StyleSheet, Dimensions } from "react-native";

import type { ViewStyleProp, TextStyleProp, ImageStyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";
import { colors } from "../global";

const { width } = Dimensions.get( "screen" );

const viewStyles: { [string]: ViewStyleProp } = StyleSheet.create( {

} );

const textStyles: { [string]: TextStyleProp } = StyleSheet.create( {

} );

const imageStyles: { [string]: ImageStyleProp } = StyleSheet.create( {
  galleryImage: {
    height: width / 4 - 2,
    width: width / 4 - 2
  },
  selected: {
    tintColor: colors.inatGreen
  }
} );

export {
  viewStyles,
  textStyles,
  imageStyles
};
