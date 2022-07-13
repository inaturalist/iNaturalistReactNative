// @flow strict-local

import { Dimensions, StyleSheet } from "react-native";
import type { ImageStyleProp, ViewStyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";

import colors from "../colors";

const { width } = Dimensions.get( "screen" );

const imageWidth = 66;

const imageStyles: { [string]: ImageStyleProp } = StyleSheet.create( {
  photo: {
    width: imageWidth,
    height: imageWidth,
    borderRadius: 8,
    marginHorizontal: 6,
    marginVertical: 27
  },
  photoStandardCamera: {
    marginTop: 50,
    marginBottom: 18
  }
} );

const heightPhotoContainerCamera = 50 + 18 + 66;

const viewStyles: { [string]: ViewStyleProp } = StyleSheet.create( {
  greenSelectionBorder: {
    borderWidth: 3,
    borderColor: colors.selectionGreen
  },
  photoContainer: {
    backgroundColor: colors.black,
    position: "absolute",
    top: 0,
    height: heightPhotoContainerCamera,
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
