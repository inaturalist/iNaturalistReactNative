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
  }
} );

const textStyles: { [string]: TextStyleProp } = StyleSheet.create( {

} );

const galleryImageWidth = width / 4 - 2;
const groupImageWidth = width / 2 - 40;

const imageStyles: { [string]: ImageStyleProp } = StyleSheet.create( {
  galleryImage: {
    height: galleryImageWidth,
    width: galleryImageWidth
  },
  selected: {
    tintColor: colors.inatGreen
  },
  imagesForGrouping: {
    height: groupImageWidth,
    width: groupImageWidth,
    marginHorizontal: 10,
    marginVertical: 10
  }
} );

export {
  viewStyles,
  textStyles,
  imageStyles
};
