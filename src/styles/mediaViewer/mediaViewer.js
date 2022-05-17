// @flow strict-local

import { StyleSheet, Dimensions } from "react-native";

import type { ImageStyleProp, ViewStyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";
import { colors } from "../global";

const { width, height } = Dimensions.get( "screen" );

const imageStyles: { [string]: ImageStyleProp } = StyleSheet.create( {
  selectedPhoto: {
    width: width,
    height: height - 300
  }
} );

const viewStyles: { [string]: ViewStyleProp } = StyleSheet.create( {
  container: {
    backgroundColor: colors.black
  },
  alignRight: {
    alignItems: "flex-end"
  },
  confirmButton: {
    backgroundColor: colors.inatGreen,
    borderRadius: 40,
    alignSelf: "center"
  },
  cancelButton: {
    backgroundColor: colors.gray,
    borderRadius: 40,
    alignSelf: "center",
    marginRight: 10
  }
} );

export {
  imageStyles,
  viewStyles
};
