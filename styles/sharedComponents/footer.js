// @flow strict-local

import { StyleSheet } from "react-native";

import type { ViewStyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";
import { colors } from "../global";

const viewStyles: { [string]: ViewStyleProp } = StyleSheet.create( {
  row: {
    backgroundColor: colors.white,
    flexDirection: "row",
    flexWrap: "nowrap",
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

export {
  viewStyles
};
