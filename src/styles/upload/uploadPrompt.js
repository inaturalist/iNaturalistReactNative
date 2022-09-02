// @flow strict-local

import { StyleSheet } from "react-native";
import type {
  ViewStyleProp
} from "react-native/Libraries/StyleSheet/StyleSheet";

const viewStyles: { [string]: ViewStyleProp } = StyleSheet.create( {
  button: {
    marginTop: 13,
    paddingVertical: 5
  }
} );

export default viewStyles;
