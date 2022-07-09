// @flow strict-local

import { StyleSheet } from "react-native";

import type { ViewStyleProp, TextStyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";
import colors from "./colors";

const viewStyles: { [string]: ViewStyleProp } = StyleSheet.create( {
  photoContainer: {
    backgroundColor: colors.black,
    height: 200
  },
  scrollView: {
    paddingBottom: 150
  },
  textContainer: {
    marginHorizontal: 25,
    marginTop: 10
  }
} );

const textStyles: { [string]: TextStyleProp } = StyleSheet.create( {
  header: {
    marginVertical: 10
  }
} );

export {
  viewStyles,
  textStyles
};
