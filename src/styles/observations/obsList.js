// @flow strict-local

import { StyleSheet } from "react-native";

import type { ViewStyleProp, TextStyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";
import { colors } from "../global";

const viewStyles: { [string]: ViewStyleProp } = StyleSheet.create( {
  toggleViewRow: {
    paddingVertical: 10,
    flexDirection: "row",
    flexWrap: "nowrap",
    justifyContent: "space-between"
  },
  exploreButtons: {
    borderRadius: 40,
    borderWidth: 1,
    top: 400,
    zIndex: 1,
    backgroundColor: colors.white
  },
  greenBanner: {
    paddingVertical: 20,
    backgroundColor: colors.inatGreen
  },
  whiteBanner: {
    paddingVertical: 20
  },
  footer: {
    paddingTop: 100
  },
  toggleButtons: {
    flexDirection: "row",
    flexWrap: "nowrap",
    marginHorizontal: 15
  },
  grayButton: {
    borderRadius: 40,
    marginTop: 17
  }
} );

const textStyles: { [string]: TextStyleProp } = StyleSheet.create( {
  center: {
    alignSelf: "center"
  },
  whiteText: {
    color: colors.white
  },
  grayButtonText: {
    fontSize: 18
  }
} );

export {
  viewStyles,
  textStyles
};
