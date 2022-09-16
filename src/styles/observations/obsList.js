// @flow strict-local

import { StyleSheet } from "react-native";
import type { TextStyleProp, ViewStyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";

import colors from "../colors";

const viewStyles: { [string]: ViewStyleProp } = StyleSheet.create( {
  whiteBackground: {
    backgroundColor: colors.white
  },
  screenContainer: {
    alignItems: "center",
    alignSelf: "stretch",
    flex: 1,
    justifyContent: "center"
  },
  stretch: {
    alignSelf: "stretch"
  },
  stretchContainer: {
    alignSelf: "stretch",
    flex: 1
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
    marginTop: 17,
    minHeight: 48,
    justifyContent: "center"
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
  textStyles,
  viewStyles
};
