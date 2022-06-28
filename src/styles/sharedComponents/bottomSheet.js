// @flow strict-local

import { StyleSheet } from "react-native";

import type { ViewStyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";
import { colors } from "../global";

const borderRadius = 30;

const viewStyles: { [string]: ViewStyleProp } = StyleSheet.create( {
  bottomSheet: {
    backgroundColor: colors.white,
    borderTopRightRadius: borderRadius,
    borderTopLeftRadius: borderRadius,
    paddingTop: 22,
    paddingBottom: 70,
    paddingHorizontal: 32,
    // shadow
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowOpacity: 0.32,
    shadowRadius: 5.46,

    elevation: 9
  }
} );

export {
  viewStyles
};




