// @flow strict-local

import { StyleSheet } from "react-native";

import type { ViewStyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";
import { colors } from "../global";

const viewStyles: { [string]: ViewStyleProp } = StyleSheet.create( {
  safeAreaContainer: {
    flex: 1,
    backgroundColor: colors.white
  },
  scrollPadding: {
    paddingBottom: 140
  }
} );

export default viewStyles;
