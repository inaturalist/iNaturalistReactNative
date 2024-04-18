// @flow

import { StyleSheet } from "react-native";
import type { ViewStyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";
import colors from "styles/tailwindColors";

const viewStyles: { []: ViewStyleProp } = StyleSheet.create( {
  menuContentStyle: {
    backgroundColor: colors.white
  }
} );

export default viewStyles;
