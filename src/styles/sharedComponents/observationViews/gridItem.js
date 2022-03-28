// @flow strict-local

import { StyleSheet, Dimensions } from "react-native";

import type { ImageStyleProp, TextStyleProp, ViewStyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";
import { colors } from "../../global";

const { width } = Dimensions.get( "screen" );

const imageWidth = width / 2 - 20;
const userImageWidth = 30;

const viewStyles: { [string]: ViewStyleProp } = StyleSheet.create( {
  gridItem: {
    width: imageWidth,
    marginHorizontal: 10
  },
  taxonName: {
    height: 100
  },
  textBox: {
    height: 50
  },
  markReviewed: {
    backgroundColor: colors.gray,
    opacity: 0.5
  },
  totalObsPhotos: {
    position: "absolute",
    right: 0,
    backgroundColor: colors.inatGreen,
    padding: 10,
    width: 40,
    zIndex: 1
  }
} );

const textStyles: { [string]: TextStyleProp } = StyleSheet.create( {
} );

const imageStyles: { [string]: ImageStyleProp } = StyleSheet.create( {
  gridImage: {
    width: imageWidth,
    height: imageWidth,
    backgroundColor: colors.black
  },
  userImage: {
    borderRadius: 50,
    width: userImageWidth,
    height: userImageWidth,
    position: "absolute",
    right: 0,
    bottom: 100
  }
} );

export {
  imageStyles,
  textStyles,
  viewStyles
};
