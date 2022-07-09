// @flow strict-local

import { StyleSheet, Dimensions } from "react-native";

import type { ViewStyleProp, TextStyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";
import colors from "../colors";

const { width } = Dimensions.get( "screen" );

const oneThirdWidth = width / 3;

const viewStyles: { [string]: ViewStyleProp } = StyleSheet.create( {
  row: {
    backgroundColor: colors.white,
    flexDirection: "row",
    flexWrap: "nowrap",
    alignItems: "center",
    justifyContent: "space-between"
  },
  headerRow: {
    flexDirection: "row",
    flexWrap: "nowrap",
    justifyContent: "space-around"
  },
  oneThirdWidth: {
    width: oneThirdWidth
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
