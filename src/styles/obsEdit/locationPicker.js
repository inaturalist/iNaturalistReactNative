// @flow strict-local

import { StyleSheet, Dimensions } from "react-native";

import type { TextStyleProp, ImageStyleProp, ViewStyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";
import { colors } from "../global";

const { width } = Dimensions.get( "screen" );

const textStyles: { [string]: TextStyleProp } = StyleSheet.create( {

} );

const imageStyles: { [string]: ImageStyleProp } = StyleSheet.create( {

} );

const viewStyles: { [string]: ViewStyleProp } = StyleSheet.create( {
  confirmButtonFooter: {
    zIndex: 1,
    height: 100,
    position: "absolute",
    bottom: 0,
    backgroundColor: colors.white,
    width,
    paddingTop: 10
  }
} );

export {
  textStyles,
  imageStyles,
  viewStyles
};
