// @flow strict-local

import { StyleSheet } from "react-native";
import type { ViewStyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";

const viewStyles: { [string]: ViewStyleProp } = StyleSheet.create( {
  mapContainer: {
    width: "100%",
    height: "100%"
  },
  map: {
    width: "100%",
    height: "100%"
  }
} );

export {
  // eslint-disable-next-line import/prefer-default-export
  viewStyles
};
