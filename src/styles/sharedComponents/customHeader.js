// @flow strict-local

import { StyleSheet, Dimensions } from "react-native";

import type { ViewStyleProp, TextStyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";
import { colors } from "../global";

const { width } = Dimensions.get( "screen" );

const viewStyles: { [string]: ViewStyleProp } = StyleSheet.create( {
  row: {
    backgroundColor: colors.white,
    flexDirection: "row",
    flexWrap: "nowrap",
    alignItems: "center",
    justifyContent: "space-between"
  },
  element: {
    width: width / 3
  }
} );

const textStyles: { [string]: TextStyleProp } = StyleSheet.create( {
  text: {
    textAlign: "center"
  }
} );

export {
  viewStyles,
  textStyles
};
