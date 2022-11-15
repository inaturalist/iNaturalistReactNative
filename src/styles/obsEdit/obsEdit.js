// @flow

import { StyleSheet } from "react-native";
import type {
  TextStyleProp,
  ViewStyleProp
} from "react-native/Libraries/StyleSheet/StyleSheet";
import colors from "styles/tailwindColors";

const textStyles: { [string]: TextStyleProp } = StyleSheet.create( {
  evidenceWarning: {
    marginBottom: 10,
    marginTop: 10,
    textAlign: "center"
  }
} );

const viewStyles: { [string]: ViewStyleProp } = StyleSheet.create( {
  bottomModal: {
    backgroundColor: colors.white,
    borderTopRightRadius: 30,
    borderTopLeftRadius: 30,
    borderColor: colors.gray,
    borderWidth: 1,
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    position: "absolute",
    bottom: 0,
    width: "100%"
  },
  row: {
    flexDirection: "row",
    flexWrap: "nowrap",
    marginVertical: 10
  }
} );

export {
  textStyles,
  viewStyles
};
