// @flow strict-local

import { StyleSheet } from "react-native";

import type { ViewStyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";

const viewStyles: { [string]: ViewStyleProp } = StyleSheet.create( {
  messages: {
    marginRight: 20
  }
} );

export {
  viewStyles
};
