// @flow

import { StyleSheet } from "react-native";
import type { ViewStyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";
import colors from "styles/tailwindColors";

const viewStyles: { [string]: ViewStyleProp } = StyleSheet.create( {
  shadow: {
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 1
    },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 2 // This property is only used on Android
  }
} );

export {
  // eslint-disable-next-line import/prefer-default-export
  viewStyles
};
