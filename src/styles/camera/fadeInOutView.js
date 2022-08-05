// @flow strict-local

import { Dimensions, StyleSheet } from "react-native";
import type { ViewStyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";

import colors from "../colors";

const { width, height } = Dimensions.get( "screen" );

const heightPhotoContainerCamera = 134;

const viewStyles: { [string]: ViewStyleProp } = StyleSheet.create( {
  fadingContainer: {
    backgroundColor: colors.black,
    position: "absolute",
    width,
    height
  },
  bottomOfPhotoPreview: {
    height: heightPhotoContainerCamera
  }
} );

export default viewStyles;
