// @flow strict-local

import { StyleSheet } from "react-native";
import type { ViewStyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";

const viewStyles: { [string]: ViewStyleProp } = StyleSheet.create( {
  secondaryButton: {
    borderRadius: 40
  }
} );

export {
  // eslint-disable-next-line import/prefer-default-export
  viewStyles
};
