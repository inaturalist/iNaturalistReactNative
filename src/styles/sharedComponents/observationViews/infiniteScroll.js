// @flow strict-local

import { StyleSheet } from "react-native";

import { colors } from "../../global";
import type { ViewStyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";

const viewStyles: { [string]: ViewStyleProp } = StyleSheet.create( {
  infiniteScroll: {
    height: 100,
    alignItems: "center",
    backgroundColor: colors.white,
    borderBottomColor: colors.lightGray,
    borderBottomWidth: 1
  }
} );

export {
  viewStyles
};
