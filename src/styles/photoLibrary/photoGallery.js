// @flow strict-local

import { Dimensions, StyleSheet } from "react-native";
import type {
  ImageStyleProp,
  ViewStyleProp
} from "react-native/Libraries/StyleSheet/StyleSheet";

const { width } = Dimensions.get( "screen" );

const viewStyles: { [string]: ViewStyleProp } = StyleSheet.create( {
  createObsButton: {
    height: 75,
    justifyContent: "center"
  },
  centerImages: {
    paddingHorizontal: 20
  },
  selectionIcon: {
    zIndex: 1,
    position: "absolute",
    top: 20,
    right: 10
  },
  numOfPhotosIcon: {
    zIndex: 1,
    position: "absolute",
    bottom: 20,
    right: 10
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
  imageStyles,
  viewStyles
};
