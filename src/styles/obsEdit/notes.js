// @flow strict-local

import { StyleSheet } from "react-native";

import type { TextStyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";
import { colors } from "../global";

const textStyles: { [string]: TextStyleProp } = StyleSheet.create( {
  notes: {
    backgroundColor: colors.white,
    paddingLeft: 5
  }
} );

export {
  textStyles
};
