// @flow strict-local

import { StyleSheet } from "react-native";
import type { ViewStyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";

import colors from "../colors";

const borderRadius = 30;

const viewStyles: { [string]: ViewStyleProp } = StyleSheet.create( {
  header: {
    height: 100,
    justifyContent: "center",
    backgroundColor: colors.inatGreen,
    borderBottomLeftRadius: borderRadius,
    borderBottomRightRadius: borderRadius
  }
} );

export default viewStyles;
