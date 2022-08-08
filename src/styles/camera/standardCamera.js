// @flow strict-local

import { Dimensions, StyleSheet } from "react-native";
import type { TextStyleProp, ViewStyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";

import colors from "../colors";

const { width } = Dimensions.get( "screen" );

const buttonRow = {
  position: "absolute",
  bottom: 75
};

const cameraCaptureRowHeight = 159;

const viewStyles: { [string]: ViewStyleProp } = StyleSheet.create( {
  container: {
    flex: 1,
    backgroundColor: colors.black
  },
  bottomButtons: {
    bottom: 0,
    position: "absolute"
  },
  captureButton: {
    position: "absolute",
    bottom: 54,
    alignSelf: "center"
  },
  nextButton: {
    position: "absolute",
    bottom: 71,
    right: 47,
    alignSelf: "flex-end"
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
    zIndex: 100,
    position: "absolute",
    borderColor: colors.white
  },
  cameraSettingsRow: {
    bottom: -52
  },
  cameraCaptureRow: {
    backgroundColor: colors.black,
    width,
    height: cameraCaptureRowHeight
  }
} );

const textStyles: { [string]: TextStyleProp } = StyleSheet.create( {
  whiteText: {
    color: colors.white,
    zIndex: 1,
    fontSize: 24
  }
} );

export {
  textStyles,
  viewStyles
};
