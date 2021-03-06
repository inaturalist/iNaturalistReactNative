// @flow strict-local

import { Dimensions, StyleSheet } from "react-native";
import type {
  ImageStyleProp,
  TextStyleProp,
  ViewStyleProp
} from "react-native/Libraries/StyleSheet/StyleSheet";

import colors from "../colors";

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
  imageStyles,
  textStyles,
  viewStyles
};
