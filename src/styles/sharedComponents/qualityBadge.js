// @flow strict-local

import { StyleSheet } from "react-native";

import type {TextStyleProp, ViewStyleProp} from "react-native/Libraries/StyleSheet/StyleSheet";
import { colors } from "../global";

const viewStyles: { [string]: ViewStyleProp } = StyleSheet.create( {
  badgeContainer: {
    backgroundColor: colors.inatGreen,
    display: "flex",
    flexDirection: "row",
    alignItems: "center"
  }
} );

const textStyles: { [string]: TextStyleProp } = StyleSheet.create( {
  badgeText: {
    color: "white",
    margin: 5
  }
} );


export {
  viewStyles,
  textStyles
};
