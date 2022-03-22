// @flow strict-local

import { StyleSheet, Dimensions } from "react-native";

import type { ViewStyleProp, TextStyleProp, ImageStyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";
import { colors } from "../global";

const { width } = Dimensions.get( "screen" );

const buttonRow = {
  position: "absolute",
  bottom: 75
};

const viewStyles: { [string]: ViewStyleProp } = StyleSheet.create( {
  container: {
    flex: 1,
    backgroundColor: colors.black
  },
  captureButton: {
    ...buttonRow,
    alignSelf: "center"
  },
  flashButton: {
    ...buttonRow,
    alignSelf: "flex-start",
    left: 50
  },
  cameraFlipButton: {
    ...buttonRow,
    alignSelf: "flex-end",
    right: 50
  },
  tapToFocusSquare: {
    width: 80,
    height: 80,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.white
  },
  photoContainer: {
    backgroundColor: colors.black,
    height: 125,
    width
  },
  row: {
    bottom: 40
  }
} );

const textStyles: { [string]: TextStyleProp } = StyleSheet.create( {

} );

const imageStyles: { [string]: ImageStyleProp } = StyleSheet.create( {
  smallPhoto: {
    height: 50,
    width: 50,
    top: 50,
    marginHorizontal: 5
  }
} );

export {
  viewStyles,
  textStyles,
  imageStyles
};
