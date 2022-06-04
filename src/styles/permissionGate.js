// @flow strict-local

import { StyleSheet } from "react-native";

import type { ViewStyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";

const viewStyles: { [string]: ViewStyleProp } = StyleSheet.create( {
  permissionButton: {
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "black",
    padding: 5
  },
  permissionGate: { flex: 1 }
} );

export {
  viewStyles
};
