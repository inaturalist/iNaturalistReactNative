// @flow strict-local

import { Dimensions, StyleSheet } from "react-native";
import type { TextStyleProp, ViewStyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";

import colors from "../colors";

const { width } = Dimensions.get( "screen" );

const heightPhotoContainerCamera = 134;

const viewStyles: { [string]: ViewStyleProp } = StyleSheet.create( {
  photoPreviewContainer: {
    backgroundColor: colors.black,
    position: "absolute",
    top: 0,
    height: heightPhotoContainerCamera,
    width
  }
} );

const textStyles: { [string]: TextStyleProp } = StyleSheet.create( {
  topPhotoText: {
    bottom: 16,
    marginLeft: 28,
    color: colors.white,
    position: "absolute",
    fontSize: 18
  }
} );

export {
  textStyles,
  viewStyles
};
