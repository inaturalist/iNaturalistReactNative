// @flow strict-local

import { StyleSheet } from "react-native";

import type { ViewStyleProp, TextStyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";
import { colors } from "../../global";

const viewStyles: { [string]: ViewStyleProp } = StyleSheet.create( {
  greenButton: {
    backgroundColor: colors.inatGreen,
    borderRadius: 40,
    paddingHorizontal: 25,
    paddingVertical: 10,
    width: "80%",
    alignSelf: "center"
  }
} );

const textStyles: { [string]: TextStyleProp } = StyleSheet.create( {
  greenButtonText: {
    color: colors.white,
    alignSelf: "center"
  }
} );

export {
  viewStyles,
  textStyles
};