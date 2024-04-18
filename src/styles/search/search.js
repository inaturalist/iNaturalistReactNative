// @flow

import { StyleSheet } from "react-native";
import type {
  ImageStyleProp,
  TextStyleProp,
  ViewStyleProp
} from "react-native/Libraries/StyleSheet/StyleSheet";
import colors from "styles/tailwindColors";

const viewStyles: { []: ViewStyleProp } = StyleSheet.create( {
  row: {
    flexDirection: "row",
    flexWrap: "nowrap",
    alignItems: "center",
    paddingVertical: 5,
    borderBottomColor: colors.darkGray,
    borderBottomWidth: 1
  },
  toggleRow: {
    flexDirection: "row",
    flexWrap: "nowrap",
    justifyContent: "space-around"
  }
} );

const textStyles: { []: TextStyleProp } = StyleSheet.create( {
  text: { }
} );

const imageWidth = 40;

const imageStyles: { []: ImageStyleProp } = StyleSheet.create( {
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
