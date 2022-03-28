// @flow strict-local

import { StyleSheet } from "react-native";

import type { ViewStyleProp, TextStyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";
import { colors } from "../global";

const viewStyles: { [string]: ViewStyleProp } = StyleSheet.create( {
  toggleViewRow: {
    flexDirection: "row",
    flexWrap: "nowrap",
    justifyContent: "space-around",
    marginVertical: 20
  },
  greenBanner: {
    paddingVertical: 20,
    backgroundColor: colors.inatGreen
  },
  whiteBanner: {
    paddingVertical: 20
  }
} );

const textStyles: { [string]: TextStyleProp } = StyleSheet.create( {
  center: {
    alignSelf: "center"
  },
  whiteText: {
    color: colors.white
  }
} );

export {
  viewStyles,
  textStyles
};
