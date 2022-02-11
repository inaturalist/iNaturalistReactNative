// @flow strict-local

import { StyleSheet } from "react-native";

import type { ViewStyleProp, TextStyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";
import { colors } from "../global";

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
  }
} );

const textStyles: { [string]: TextStyleProp } = StyleSheet.create( {

} );

export {
  viewStyles,
  textStyles
};
