/* eslint-disable no-undef */
// @flow strict-local

import { Dimensions, StyleSheet } from "react-native";
import type { TextStyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";

const { width } = Dimensions.get( "screen" );

const textStyles: { [string]: TextStyleProp } = StyleSheet.create( {
  projectName: {
    maxWidth: width - 100,
    flexWrap: "wrap-reverse"
  }
} );

export {
  // eslint-disable-next-line import/prefer-default-export
  textStyles
};
