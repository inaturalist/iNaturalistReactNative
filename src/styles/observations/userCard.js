// @flow strict-local

import { StyleSheet } from "react-native";
import type { TextStyleProp, ViewStyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";

import colors from "../colors";

const viewStyles: { [string]: ViewStyleProp } = StyleSheet.create( {
  userCard: {
    flexDirection: "row",
    marginHorizontal: 20,
    alignItems: "center"
  },
  userDetails: {
    marginLeft: 10
  },
  editProfile: {
    position: "absolute",
    right: 0
  },
  topCard: {
    height: 100
  }
} );

const textStyles: { [string]: TextStyleProp } = StyleSheet.create( {
  text: {
    color: colors.white,
    marginVertical: 3
  }
} );

export {
  textStyles,
  viewStyles
};
