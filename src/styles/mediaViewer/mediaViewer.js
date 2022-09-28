// @flow strict-local

import { Dimensions, StyleSheet } from "react-native";
import type {
  ImageStyleProp, TextStyleProp, ViewStyleProp
} from "react-native/Libraries/StyleSheet/StyleSheet";

import colors from "../colors";

const { width, height } = Dimensions.get( "screen" );

const PHOTO_HEIGHT = height - 350;
const ARROW_BUTTON_HEIGHT = 16 + 40;

const imageStyles: { [string]: ImageStyleProp } = StyleSheet.create( {
  selectedPhoto: {
    width,
    height: PHOTO_HEIGHT
  },
  fullSize: {
    width: "100%",
    height: "100%"
  }
} );

const viewStyles: { [string]: ViewStyleProp } = StyleSheet.create( {
  fullSize: {
    width: "100%",
    height: "100%"
  },
  container: {
    backgroundColor: colors.black,
    margin: 0
  },
  alignRight: {
    alignItems: "flex-end"
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
  },
  arrow: {
    zIndex: 1,
    position: "absolute",
    top: ( PHOTO_HEIGHT + ARROW_BUTTON_HEIGHT ) / 2,
    padding: 20
  },
  leftArrow: {
    left: 0
  },
  rightArrow: {
    right: 0
  }
} );

const textStyles: { [string]: TextStyleProp } = StyleSheet.create( {
  whiteText: {
    color: colors.white
  }
} );

export {
  imageStyles,
  textStyles,
  viewStyles
};
