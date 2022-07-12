// @flow strict-local

import { StyleSheet } from "react-native";
import type { TextStyleProp, ViewStyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";

import colors from "../../colors";

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
  textStyles,
  viewStyles
};
