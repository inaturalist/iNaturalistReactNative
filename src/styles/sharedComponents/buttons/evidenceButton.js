// @flow strict-local

import { StyleSheet } from "react-native";
import type { TextStyleProp, ViewStyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";

import colors from "../../colors";

const viewStyles: { [string]: ViewStyleProp } = StyleSheet.create( {
  greenButton: {
    backgroundColor: colors.inatGreen,
    borderRadius: 65,
    height: 65,
    maxHeight: 65,
    width: 65,
    maxWidth: 65,
    display: "flex",
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  disabled: {
    backgroundColor: colors.midGray
  }
} );

const textStyles: { [string]: TextStyleProp } = StyleSheet.create( {
  greenButtonIcon: {
    color: colors.white
  }
} );

export {
  textStyles,
  viewStyles
};
