// @flow strict-local

import { StyleSheet } from "react-native";
import type { ViewStyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";

const viewStyles: { [string]: ViewStyleProp } = StyleSheet.create( {
  input: {
    height: 50
  },
  button: {
    marginTop: 30
  },
  logoutForm: {
    alignItems: "center"
  }
} );

export default viewStyles;
