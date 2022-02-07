// @flow strict-local

import { StyleSheet } from "react-native";

import type {
  ViewStyleProp,
  TextStyleProp
} from "react-native/Libraries/StyleSheet/StyleSheet";

const viewStyles: { [string]: ViewStyleProp } = StyleSheet.create( {
  row: {
    flexDirection: "row",
    flexWrap: "nowrap",
    marginVertical: 10
  },
  input: {
    color: "#000000",
    backgroundColor: "#ffffff"
  }
} );

const textStyles: { [string]: TextStyleProp } = StyleSheet.create( {
  text: {},
  error: {
    color: "#ff0000"
  }
} );

export { viewStyles, textStyles };
