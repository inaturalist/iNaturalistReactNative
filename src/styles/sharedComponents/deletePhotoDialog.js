// @flow strict-local

import { StyleSheet } from "react-native";
import type { ViewStyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";
import colors from "styles/colors";

const viewStyles: { [string]: ViewStyleProp } = StyleSheet.create( {
  confirmButton: {
    backgroundColor: colors.inatGreen,
    borderRadius: 40,
    alignSelf: "center"
  },
  cancelButton: {
    backgroundColor: colors.gray,
    borderRadius: 40,
    alignSelf: "center",
    marginRight: 10
  }
} );

export {
  // eslint-disable-next-line import/prefer-default-export
  viewStyles
};
