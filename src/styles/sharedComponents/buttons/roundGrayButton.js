// @flow

import colors from "colors";
import { StyleSheet } from "react-native";
import type { TextStyleProp, ViewStyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";

const viewStyles: { [string]: ViewStyleProp } = StyleSheet.create( {
  grayButton: {
    backgroundColor: colors.midGray,
    borderRadius: 40,
    alignSelf: "center",
    padding: 5
  },
  disabled: {
    backgroundColor: colors.lightGray
  }
} );

const textStyles: { [string]: TextStyleProp } = StyleSheet.create( {
  grayButtonText: {
    color: colors.black,
    alignSelf: "center"
  },
  disabled: {
    color: colors.midGray
  }
} );

export {
  textStyles,
  viewStyles
};
