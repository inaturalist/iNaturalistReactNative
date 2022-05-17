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
    alignSelf: "center",
    padding: 10,
    zIndex: 1
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
    bottom: -50
  },
  secondRow: {
    backgroundColor: colors.black,
    width,
    height: 125
  },
  deleteButton: {
    paddingHorizontal: 10,
    left: 44,
    top: -50,
    paddingVertical: 10
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

const textStyles: { [string]: TextStyleProp } = StyleSheet.create( {
  whiteText: {
    color: colors.white,
    zIndex: 1,
    fontSize: 24
  },
  topPhotoText: {
    bottom: 10,
    color: colors.white,
    position: "absolute",
    fontSize: 18
  }
} );

const imageStyles: { [string]: ImageStyleProp } = StyleSheet.create( {
  smallPhoto: {
    height: 80,
    width: 80,
    top: 40,
    borderRadius: 10,
    marginHorizontal: 5
  }
} );

export {
  viewStyles,
  textStyles,
  imageStyles
};
