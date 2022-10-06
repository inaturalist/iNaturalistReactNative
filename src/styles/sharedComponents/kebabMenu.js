// @flow strict-local

import { StyleSheet } from "react-native";
import type { ViewStyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";

import colors from "../colors";

const viewStyles: { [string]: ViewStyleProp } = StyleSheet.create( {
  menuContentStyle: {
    backgroundColor: colors.white
  }
} );

export default viewStyles;
