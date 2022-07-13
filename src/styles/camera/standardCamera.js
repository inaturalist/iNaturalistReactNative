// @flow strict-local

import { Dimensions, StyleSheet } from "react-native";
import type { TextStyleProp, ViewStyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";

import colors from "../colors";

const { width } = Dimensions.get( "screen" );

const buttonRow = {
  position: "absolute",
  bottom: 75
};

const cameraCaptureRowHeight = 69 + 36 + 54;

const viewStyles: { [string]: ViewStyleProp } = StyleSheet.create( {
  container: {
    flex: 1,
    backgroundColor: colors.black
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
    borderColor: colors.white
  },
  cameraSettingsRow: {
    bottom: -52
  },
  cameraCaptureRow: {
    backgroundColor: colors.black,
    width,
    height: cameraCaptureRowHeight
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

export {
  textStyles,
  viewStyles
};
