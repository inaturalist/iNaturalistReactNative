// @flow strict-local

import { Dimensions, StyleSheet } from "react-native";
import type {
  ImageStyleProp,
  TextStyleProp,
  ViewStyleProp
} from "react-native/Libraries/StyleSheet/StyleSheet";

const { width } = Dimensions.get( "screen" );

const viewStyles: { [string]: ViewStyleProp } = StyleSheet.create( {
} );

const textStyles: { [string]: TextStyleProp } = StyleSheet.create( {
  descriptionText: {
    marginVertical: 10
  }
} );

const imageStyles: { [string]: ImageStyleProp } = StyleSheet.create( {
  headerImage: {
    width,
    height: 150
  },
  icon: {
    zIndex: 1,
    width: 50,
    height: 50,
    alignSelf: "center",
    top: 45
  }
} );

export {
  imageStyles,
  textStyles,
  viewStyles
};
