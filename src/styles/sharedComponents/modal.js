// @flow strict-local

import { StyleSheet } from "react-native";
import type { TextStyleProp, ViewStyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";
import colors from "styles/colors";

const viewStyles: { [string]: ViewStyleProp } = StyleSheet.create( {
  whiteModal: {
    backgroundColor: colors.white,
    borderRadius: 40,
    padding: 20
  }
} );

const textStyles: { [string]: TextStyleProp } = StyleSheet.create( {
  whiteText: {
    color: colors.white,
    marginVertical: 10
  }
} );

export {
  textStyles,
  viewStyles
};
