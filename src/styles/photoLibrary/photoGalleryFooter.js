// @flow strict-local

import { StyleSheet } from "react-native";

import { colors } from "../global";
import type { ViewStyleProp, TextStyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";

const viewStyles: { [string]: ViewStyleProp } = StyleSheet.create( {
  footer: {
    height: 70,
    flexDirection: "row",
    justifyContent: "space-between"
  },
  selectionModal: {
    padding: 20,
    backgroundColor: colors.white,
    position: "absolute",
    bottom: 100,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4
  },
  nextButton: {
    width: 100
  },
  selectionButtons: {
    flexDirection: "row"
  }
} );

const textStyles: { [string]: TextStyleProp } = StyleSheet.create( {
  selections: {
    marginVertical: 10
  }
} );

export {
  viewStyles,
  textStyles
};
