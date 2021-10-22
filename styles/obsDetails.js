// @flow strict-local

import { StyleSheet } from "react-native";

import type { ViewStyleProp, TextStyleProp, ImageStyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";
import { colors } from "./global";

const viewStyles: { [string]: ViewStyleProp } = StyleSheet.create( {
  imageBackground: {
    width: 75,
    height: 75,
    borderRadius: 10,
    backgroundColor: colors.black,
    marginHorizontal: 20
  },
  obsDetailsColumn: {
    width: 200
  },
  photoContainer: {
    backgroundColor: colors.black,
    height: 200
  },
  row: {
    flexDirection: "row",
    flexWrap: "nowrap",
    marginVertical: 10
  },
  userProfileRow: {
    flexDirection: "row",
    flexWrap: "nowrap",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 10,
    marginVertical: 5
  }
} );

const textStyles: { [string]: TextStyleProp } = StyleSheet.create( {
  text: { }
} );

const imageStyles: { [string]: ImageStyleProp } = StyleSheet.create( {
  userProfileIcon: {
    width: 50,
    height: 50,
    borderRadius: 50
  }
} );

export {
  viewStyles,
  textStyles,
  imageStyles
};
