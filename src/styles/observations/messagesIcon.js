// @flow strict-local

import { StyleSheet } from "react-native";

import type { ViewStyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";

const viewStyles: { [string]: ViewStyleProp } = StyleSheet.create( {
  messages: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginRight: 20
  }
} );

export {
  viewStyles
};
