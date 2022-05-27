// @flow strict-local

import { StyleSheet, Dimensions } from "react-native";

import type { ImageStyleProp, ViewStyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";
import { colors } from "../global";

const { width } = Dimensions.get( "screen" );

const imageWidth = 66;

const imageStyles: { [string]: ImageStyleProp } = StyleSheet.create( {
  photo: {
    width: imageWidth,
    height: imageWidth,
    borderRadius: 8,
    marginHorizontal: 6,
    marginVertical: 27
  }
} );

const viewStyles: { [string]: ViewStyleProp } = StyleSheet.create( {
  greenSelectionBorder: {
    borderWidth: 3,
    borderColor: colors.selectionGreen
  },
  photoContainer: {
    backgroundColor: colors.black,
    paddingTop: 20,
    height: 125,
    width
  },
  deleteButton: {
    paddingHorizontal: 10,
    left: 45,
    top: -100,
    paddingVertical: 10
  }
} );

export {
  imageStyles,
  viewStyles
};
