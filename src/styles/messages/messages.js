// @flow strict-local

import { StyleSheet, Dimensions } from "react-native";

import type { TextStyleProp, ImageStyleProp, ViewStyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";

const { width } = Dimensions.get( "screen" );

const viewStyles: { [string]: ViewStyleProp } = StyleSheet.create( {
  row: {
    flexDirection: "row",
    flexWrap: "nowrap",
    alignItems: "center",
    paddingVertical: 5,
    paddingHorizontal: 20
  }
} );

const textStyles: { [string]: TextStyleProp } = StyleSheet.create( {
  messageSubject: {
    maxWidth: width - 100,
    flexWrap: "wrap-reverse"
  },
  messageFrom: {
    maxWidth: width - 100,
    flexWrap: "wrap-reverse",
    fontWeight: "bold"
  }
} );

const imageStyles: { [string]: ImageStyleProp } = StyleSheet.create( {
  messageIcon: {
    width: 50,
    height: 50,
    borderRadius: 10,
    marginHorizontal: 20
  }
} );

export {
  textStyles,
  imageStyles,
  viewStyles
};
