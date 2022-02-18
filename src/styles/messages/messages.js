// @flow strict-local

import { StyleSheet, Dimensions } from "react-native";

import type { TextStyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";

const { width } = Dimensions.get( "screen" );

const textStyles: { [string]: TextStyleProp } = StyleSheet.create( {
  projectName: {
    maxWidth: width - 100,
    flexWrap: "wrap-reverse"
  }
} );


export {
  textStyles
};
