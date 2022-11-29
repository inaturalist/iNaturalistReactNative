// @flow

import { StyleSheet } from "react-native";
import type {
  ImageStyleProp,
  TextStyleProp,
  ViewStyleProp
} from "react-native/Libraries/StyleSheet/StyleSheet";
import colors from "styles/tailwindColors";

const viewStyles: { [string]: ViewStyleProp } = StyleSheet.create( {
  bottomModal: {
    padding: 0,
    backgroundColor: colors.white,
    shadowColor: "#000",
    borderTopStartRadius: 24,
    borderTopEndRadius: 24,
    shadowOffset: {
      width: 0,
      height: 12
    },
    shadowOpacity: 0.75,
    shadowRadius: 16.0,
    elevation: 24
  }
} );

const textStyles: { [string]: TextStyleProp } = StyleSheet.create( {
  activityItemBody: {
    color: colors.logInGray
  }
} );

const imageStyles: { [string]: ImageStyleProp } = StyleSheet.create( {
  smallIcon: {
    width: 15,
    height: 15,
    tintColor: colors.logInGray
  }
} );

export {
  imageStyles,
  textStyles,
  viewStyles
};
