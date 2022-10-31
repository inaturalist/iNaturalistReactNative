// @flow

import colors from "colors";
import { StyleSheet } from "react-native";
import type { ViewStyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";

const viewStyles: { [string]: ViewStyleProp } = StyleSheet.create( {
  menuContentStyle: {
    backgroundColor: colors.white
  }
} );

export default viewStyles;
