// @flow strict-local

import { StyleSheet } from "react-native";
import type { TextStyleProp, ViewStyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";
import colors from "styles/colors";

const borderRadius = 30;

const viewStyles: { [string]: ViewStyleProp } = StyleSheet.create( {
  loggedOutCard: {
    height: 101,
    justifyContent: "center",
    backgroundColor: colors.inatGreen,
    borderBottomLeftRadius: borderRadius,
    borderBottomRightRadius: borderRadius
  }
} );

const textStyles: { [string]: TextStyleProp } = StyleSheet.create( {
  centerText: {
    textAlign: "center",
    color: colors.white
  }
} );

export {
  textStyles,
  viewStyles
};
