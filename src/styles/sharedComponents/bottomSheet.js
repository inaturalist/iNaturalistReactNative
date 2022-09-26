// @flow strict-local

import { StyleSheet } from "react-native";
import type { ViewStyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";

import colors from "../colors";

const borderRadius = 24;

const viewStyles: { [string]: ViewStyleProp } = StyleSheet.create( {
  bottomSheet: {
    flex: 1,
    paddingTop: 22,
    paddingBottom: 70,
    paddingHorizontal: 32
  },
  shadow: {
    shadowColor: colors.black,
    borderTopStartRadius: borderRadius,
    borderTopEndRadius: borderRadius,
    shadowOffset: {
      width: 0,
      height: 12
    },
    shadowOpacity: 0.75,
    shadowRadius: 16.0,
    elevation: 24
  }
} );

export {
  // eslint-disable-next-line import/prefer-default-export
  viewStyles
};
