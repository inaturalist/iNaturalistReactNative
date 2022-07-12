// @flow strict-local

import { StyleSheet } from "react-native";
import type { TextStyleProp, ViewStyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";

import colors from "../colors";

const viewStyles: { [string]: ViewStyleProp } = StyleSheet.create( {
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-around",

    height: 80,
    backgroundColor: colors.white
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

} );

export {
  textStyles,
  viewStyles
};
