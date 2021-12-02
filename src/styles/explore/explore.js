// @flow strict-local

import { StyleSheet } from "react-native";

import type { ViewStyleProp, TextStyleProp, ImageStyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";
import { colors } from "../global";

const viewStyles: { [string]: ViewStyleProp } = StyleSheet.create( {
} );

const textStyles: { [string]: TextStyleProp } = StyleSheet.create( {
  explanation: {
    color: colors.gray,
    textAlign: "center",
    marginVertical: 10
  }
} );

const imageStyles: { [string]: ImageStyleProp } = StyleSheet.create( {
} );

export {
  viewStyles,
  textStyles,
  imageStyles
};
