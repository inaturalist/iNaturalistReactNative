// @flow strict-local

import { StyleSheet } from "react-native";

import type { ViewStyleProp, TextStyleProp, ImageStyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";
import { colors } from "../global";

const viewStyles: { [string]: ViewStyleProp } = StyleSheet.create( {
  dropdown: {
    backgroundColor: colors.white,
    borderColor: colors.gray,
    borderRadius: 40,
    borderWidth: 0.5,
    height: 37,
    paddingLeft: 15,
    marginHorizontal: 50,
    marginVertical: 20,
    width: "75%"
  }
} );

const textStyles: { [string]: TextStyleProp } = StyleSheet.create( {
  explanation: {
    color: colors.gray,
    textAlign: "center",
    marginVertical: 10
  }
} );

const imageStyles: { [string]: ImageStyleProp } = StyleSheet.create( {
  pickerIcon: {
    width: 25,
    height: 25
  }
} );

export {
  viewStyles,
  textStyles,
  imageStyles
};
