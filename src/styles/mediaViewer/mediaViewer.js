// @flow strict-local

import { Dimensions, StyleSheet } from "react-native";
import type {
  ImageStyleProp, TextStyleProp, ViewStyleProp
} from "react-native/Libraries/StyleSheet/StyleSheet";

import colors from "../colors";

const { width, height } = Dimensions.get( "screen" );

const imageStyles: { [string]: ImageStyleProp } = StyleSheet.create( {
  selectedPhoto: {
    width,
    height: height - 350
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
