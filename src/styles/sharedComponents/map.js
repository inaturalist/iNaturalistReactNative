// @flow strict-local

import { Dimensions, StyleSheet } from "react-native";

import type { ViewStyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";

const { width, height } = Dimensions.get( "screen" );

const viewStyles: { [string]: ViewStyleProp } = StyleSheet.create( {
  mapContainer: {
    width,
    height
  },
  map: {
    ...StyleSheet.absoluteFillObject
  }
} );

export {
  viewStyles
};
