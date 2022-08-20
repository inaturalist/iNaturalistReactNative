// @flow strict-local

import { StyleSheet } from "react-native";
import type { TextStyleProp, ViewStyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";

import colors from "../../colors";

const PRIMARY = "#5D8017";
const WARNING = "#9B1111";
const NEUTRAL = "#979797";

const viewStyles: { [string]: ViewStyleProp } = StyleSheet.create( {
  containerDefault: {
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 40,
    marginVertical: 15,
    marginHorizontal: 10
  },
  containerPrimary: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY
  },
  containerWarning: {
    backgroundColor: WARNING,
    borderColor: WARNING
  },
  containerNeutral: {
    backgroundColor: NEUTRAL,
    borderColor: NEUTRAL
  },
  containerDisabled: {
    opacity: 0.65
  }

} );

const textStyles: { [string]: TextStyleProp } = StyleSheet.create( {
  textDefault: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.white
  }

} );

export {
  textStyles,
  viewStyles
};
