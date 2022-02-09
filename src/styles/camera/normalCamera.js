// @flow strict-local

import { StyleSheet } from "react-native";

import type { ViewStyleProp, TextStyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";
import { colors } from "../global";

const viewStyles: { [string]: ViewStyleProp } = StyleSheet.create( {
  container: {
    flex: 1,
    backgroundColor: colors.black
  },
  captureButton: {
    position: "absolute",
    alignSelf: "center",
    bottom: 75
  }
} );

const textStyles: { [string]: TextStyleProp } = StyleSheet.create( {

} );

export {
  viewStyles,
  textStyles
};
