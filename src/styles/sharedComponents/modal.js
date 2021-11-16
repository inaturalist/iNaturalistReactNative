// @flow strict-local

import { StyleSheet } from "react-native";

import type { TextStyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";
import { colors } from "../global";

const textStyles: { [string]: TextStyleProp } = StyleSheet.create( {
  whiteText: {
    color: colors.white,
    marginVertical: 10
  }
} );

export {
  textStyles
};
