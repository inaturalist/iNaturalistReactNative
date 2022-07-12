// @flow

import { StyleSheet } from "react-native";
import type { TextStyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";

import colors from "../colors";

const textStyles: { [string]: TextStyleProp } = StyleSheet.create( {
  inputField: {
    backgroundColor: colors.white,
    borderColor: colors.gray,
    borderRadius: 40,
    borderWidth: 0.5,
    color: colors.black,
    height: 37,
    paddingLeft: 15,
    marginHorizontal: 50
    // marginVertical: 20
  }
} );

export default textStyles;
