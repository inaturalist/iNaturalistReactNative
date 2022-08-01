// @flow strict-local

import { Dimensions, StyleSheet } from "react-native";
import type { ViewStyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";

import colors from "../colors";

const { width } = Dimensions.get( "screen" );

const viewStyles: { [string]: ViewStyleProp } = StyleSheet.create( {
  fadingContainer: {
    backgroundColor: colors.black,
    position: "absolute",
    width
  }
} );

export default viewStyles;
