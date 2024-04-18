// @flow strict-local
/* eslint-disable no-undef */

import { Dimensions, StyleSheet } from "react-native";
import type {
  ImageStyleProp,
  TextStyleProp,
  ViewStyleProp
} from "react-native/Libraries/StyleSheet/StyleSheet";

const { width } = Dimensions.get( "screen" );

const viewStyles: { [string]: ViewStyleProp } = StyleSheet.create( {
  row: {
    flexDirection: "row",
    flexWrap: "nowrap",
    alignItems: "center",
    paddingVertical: 5
  },
  buttonRow: {
    flexDirection: "row",
    flexWrap: "nowrap",
    justifyContent: "space-evenly"
  }
} );

const textStyles: { [string]: TextStyleProp } = StyleSheet.create( {
  projectName: {
    maxWidth: width - 100,
    flexWrap: "wrap-reverse"
  }
} );

const imageStyles: { [string]: ImageStyleProp } = StyleSheet.create( {
  projectIcon: {
    width: 50,
    height: 50,
    borderRadius: 10,
    marginHorizontal: 20
  }
} );

export {
  imageStyles,
  textStyles,
  viewStyles
};
