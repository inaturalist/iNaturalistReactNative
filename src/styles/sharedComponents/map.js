// @flow strict-local

import { Dimensions, StyleSheet } from "react-native";

import type { ViewStyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";

const { width } = Dimensions.get( "screen" );

const viewStyles: { [string]: ViewStyleProp } = StyleSheet.create( {
  mapContainer: {
    width,
    height: 150
  },
  map: {
    ...StyleSheet.absoluteFillObject
  }
} );

export {
  viewStyles
};
