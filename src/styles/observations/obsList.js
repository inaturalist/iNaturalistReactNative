// @flow strict-local

import { StyleSheet } from "react-native";

import type { ViewStyleProp, TextStyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";

const viewStyles: { [string]: ViewStyleProp } = StyleSheet.create( {
  toggleViewRow: {
    flexDirection: "row",
    flexWrap: "nowrap",
    justifyContent: "space-around",
    marginVertical: 20
  }
} );

const textStyles: { [string]: TextStyleProp } = StyleSheet.create( {
  text: { }
} );

export {
  viewStyles,
  textStyles
};
