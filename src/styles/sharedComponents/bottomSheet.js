// @flow strict-local

import { StyleSheet } from "react-native";
import type { ViewStyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";

import colors from "../colors";

const borderRadius = 30;

const viewStyles: { [string]: ViewStyleProp } = StyleSheet.create( {
  bottomModal: {
    backgroundColor: colors.white,
    borderTopRightRadius: borderRadius,
    borderTopLeftRadius: borderRadius,
    paddingTop: 22,
    paddingBottom: 70,
    paddingHorizontal: 32
  }
} );

export {
  // eslint-disable-next-line import/prefer-default-export
  viewStyles
};
