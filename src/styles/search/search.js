// @flow strict-local

import { StyleSheet } from "react-native";
import type {
  ImageStyleProp,
  TextStyleProp,
  ViewStyleProp
} from "react-native/Libraries/StyleSheet/StyleSheet";

import colors from "../colors";

const viewStyles: { [string]: ViewStyleProp } = StyleSheet.create( {
  row: {
    flexDirection: "row",
    flexWrap: "nowrap",
    alignItems: "center",
    paddingVertical: 5,
    borderBottomColor: colors.gray,
    borderBottomWidth: 1
  },
  toggleRow: {
    flexDirection: "row",
    flexWrap: "nowrap",
    justifyContent: "space-around"
  }
} );

const textStyles: { [string]: TextStyleProp } = StyleSheet.create( {
  text: { }
} );

const imageWidth = 40;

const imageStyles: { [string]: ImageStyleProp } = StyleSheet.create( {
  circularImage: {
    width: imageWidth,
    height: imageWidth,
    borderRadius: 50,
    marginRight: 10
  },
  squareImage: {
    width: imageWidth,
    height: imageWidth,
    marginRight: 10
  }
} );

export {
  imageStyles,
  textStyles,
  viewStyles
};
