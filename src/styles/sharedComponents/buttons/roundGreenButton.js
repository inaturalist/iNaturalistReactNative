// @flow strict-local

import { StyleSheet } from "react-native";

import type { ViewStyleProp, TextStyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";
import { colors } from "../../global";

const viewStyles: { [string]: ViewStyleProp } = StyleSheet.create( {
  greenButton: {
    backgroundColor: colors.inatGreen,
    borderRadius: 40,
    alignSelf: "center"
  },
  disabled: {
    backgroundColor: colors.inatGreenDisabled
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
