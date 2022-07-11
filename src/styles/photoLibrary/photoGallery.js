// @flow strict-local

import { StyleSheet, Dimensions } from "react-native";

import type { ViewStyleProp, TextStyleProp, ImageStyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";
import { colors } from "../global";

const { width } = Dimensions.get( "screen" );

const viewStyles: { [string]: ViewStyleProp } = StyleSheet.create( {
  createObsButton: {
    height: 75,
    justifyContent: "center"
  },
  centerImages: {
    paddingHorizontal: 20
  },
  multiplePhotoTextBackground: {
    zIndex: 1
  }
} );

const textStyles: { [string]: TextStyleProp } = StyleSheet.create( {
  multiplePhotoText: {
    color: colors.inatGreen,
    fontSize: 20,
    position: "absolute",
    right: 20,
    top: 20,
    backgroundColor: colors.white
  }
} );

const galleryImageWidth = width / 4 - 2;
const groupImageWidth = width / 2 - 40;

const imageStyles: { [string]: ImageStyleProp } = StyleSheet.create( {
  galleryImage: {
    height: galleryImageWidth,
    width: galleryImageWidth
  },
  imagesForGrouping: {
    height: groupImageWidth,
    width: groupImageWidth,
    marginHorizontal: 10,
    marginVertical: 10
  },
  selectedIcon: {
    zIndex: 1,
    right: 0,
    position: "absolute",
    top: 0
  }
} );

export {
  viewStyles,
  textStyles,
  imageStyles
};
