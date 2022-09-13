// @flow strict-local

import { StyleSheet } from "react-native";
import type { ViewStyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";

import colors from "../colors";

const borderRadius = 30;

const viewStyles: { [string]: ViewStyleProp } = StyleSheet.create( {
  bottomSheet: {
    flex: 1,
    paddingTop: 22,
    paddingBottom: 70,
    paddingHorizontal: 32
  },
  shadow: {
    borderTopRightRadius: borderRadius,
    borderTopLeftRadius: borderRadius,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: -3
    },
    shadowOpacity: 0.20,
    shadowRadius: 2
  }
} );

export {
  // eslint-disable-next-line import/prefer-default-export
  viewStyles
};
