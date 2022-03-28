// @flow strict-local

import { StyleSheet } from "react-native";

import type { ViewStyleProp, TextStyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";
import { colors } from "../global";

const viewStyles: { [string]: ViewStyleProp } = StyleSheet.create( {
  toggleViewRow: {
    width: 140,
    flexDirection: "row",
    flexWrap: "nowrap",
    justifyContent: "space-around",
    paddingVertical: 20,
    position: "absolute"
  },
  exploreButtons: {
    borderRadius: 40,
    borderWidth: 1,
    top: 400,
    zIndex: 1,
    backgroundColor: colors.white
  },
  obsListButtons: {
    right: 0,
    top: 100
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
