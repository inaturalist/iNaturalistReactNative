// @flow strict-local

import { StyleSheet } from "react-native";
import type { TextStyleProp, ViewStyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";
import colors from "styles/colors";

const PRIMARY = "#5D8017";
const PRIMARY_DISABLED = "#C6DC98";
const WARNING = "#9B1111";
const WARNING_DISABLED = "#B95F5E";
const NEUTRAL = "#979797";
const NEUTRAL_DISABLED = "#D3D3D3";

const viewStyles: { [string]: ViewStyleProp } = StyleSheet.create( {
  containerDefault: {
    borderRadius: 40
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
  containerPrimaryDisabled: {
    backgroundColor: PRIMARY_DISABLED,
    borderColor: PRIMARY_DISABLED
  },
  containerNeutralDisabled: {
    backgroundColor: NEUTRAL_DISABLED,
    borderColor: NEUTRAL_DISABLED
  },
  containerWarningDisabled: {
    backgroundColor: WARNING_DISABLED,
    borderColor: WARNING_DISABLED
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
