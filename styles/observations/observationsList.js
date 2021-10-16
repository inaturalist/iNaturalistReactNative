// @flow strict-local

import { StyleSheet } from "react-native";
import { colors } from "../global";

import type { ViewStyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";

const viewStyles: { [string]: ViewStyleProp } = StyleSheet.create( {
  safeAreaContainer: {
    flex: 1,
    backgroundColor: colors.white
  }
} );

export default viewStyles;
