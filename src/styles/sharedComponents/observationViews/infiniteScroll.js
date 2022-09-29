// @flow strict-local

import { StyleSheet } from "react-native";
import type { ViewStyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";
import colors from "styles/colors";

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
  // eslint-disable-next-line import/prefer-default-export
  viewStyles
};
