// @flow

import { StyleSheet } from "react-native";
import type { ViewStyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";
import colors from "styles/tailwindColors";

const viewStyles: { [string]: ViewStyleProp } = StyleSheet.create( {
  shadow: {
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: -3
    },
    shadowOpacity: 0.20,
    shadowRadius: 2,
    elevation: 5
  }
} );

export {
  // eslint-disable-next-line import/prefer-default-export
  viewStyles
};
