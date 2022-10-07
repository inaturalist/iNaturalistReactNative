// @flow strict-local

import { Dimensions, StyleSheet } from "react-native";
import type { TextStyleProp, ViewStyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";
import colors from "styles/colors";

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
  textStyles,
  viewStyles
};
