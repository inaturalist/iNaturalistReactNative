// @flow strict-local

import { StyleSheet } from "react-native";

import type { ViewStyleProp, TextStyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";

const viewStyles: { [string]: ViewStyleProp } = StyleSheet.create( {
  container: {
    flex: 1
  }
} );

const textStyles: { [string]: TextStyleProp } = StyleSheet.create( {

} );

export {
  viewStyles,
  textStyles
};
