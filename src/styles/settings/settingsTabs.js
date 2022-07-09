// @flow strict-local

import { StyleSheet } from "react-native";

import type { TextStyleProp, ViewStyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";
import colors from "../colors";

const viewStyles: { [string]: ViewStyleProp } = StyleSheet.create( {
  container: {
    backgroundColor: colors.white,
    display: "flex",
    flexDirection: "column",
    flexWrap: "nowrap",
    height: "100%"
  },
  tabsRow: {
    backgroundColor: colors.white,
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
    height: 75,
    justifyContent: "space-evenly"
  },
  shadow: {
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: -3
    },
    shadowOpacity: 0.20,
    shadowRadius: 2
  }
} );

const textStyles: { [string]: TextStyleProp } = StyleSheet.create( {
  text: {
    fontSize: 20
  }
} );

export {
  viewStyles,
  textStyles
};
