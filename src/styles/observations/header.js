// @flow strict-local

import { StyleSheet } from "react-native";
import type { ViewStyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";
import colors from "styles/colors";

const borderRadius = 30;

const viewStyles: { [string]: ViewStyleProp } = StyleSheet.create( {
  header: {
    backgroundColor: colors.inatGreen,
    borderBottomLeftRadius: borderRadius,
    borderBottomRightRadius: borderRadius,
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 1
  },
  toolbar: {
    paddingVertical: 10,
    flexDirection: "row",
    flexWrap: "nowrap",
    justifyContent: "space-between",
    backgroundColor: colors.white
  },
  exploreButtons: {
    borderRadius: 40,
    borderWidth: 1,
    top: 400,
    zIndex: 1,
    backgroundColor: colors.white
  }
} );

export default viewStyles;
