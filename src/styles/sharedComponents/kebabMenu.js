// @flow strict-local

import { StyleSheet } from "react-native";

import type { ViewStyleProp, TextStyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";

import { colors } from "../global";

const viewStyles: { [string]: ViewStyleProp } = StyleSheet.create( {
  menuContentStyle: {
    backgroundColor: colors.white
  }
} );


const textStyles: { [string]: TextStyleProp } = StyleSheet.create( {
  title: {
    color: colors.black
  }
} );

export {
  viewStyles,
  textStyles
};
