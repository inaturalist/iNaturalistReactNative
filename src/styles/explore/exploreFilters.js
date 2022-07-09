// @flow strict-local

import { StyleSheet } from "react-native";

import type { TextStyleProp, ViewStyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";
import colors from "../colors";

const pickerSelectStyles: { [string]: TextStyleProp } = StyleSheet.create( {
  inputIOS: {
    width: 250,
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 40,
    color: "black",
    paddingRight: 30 // to ensure the text is never behind the icon
  },
  inputAndroid: {
    width: 250,
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: "purple",
    borderRadius: 8,
    color: "black",
    paddingRight: 30 // to ensure the text is never behind the icon
  }
} );

const checkboxWidth = 18;

const viewStyles: { [string]: ViewStyleProp } = StyleSheet.create( {
  checkbox: {
    width: checkboxWidth,
    height: checkboxWidth,
    padding: 10
  },
  checkboxRow: {
    flexDirection: "row",
    flexWrap: "nowrap"
  },
  filtersRow: {
    flexDirection: "row",
    flexWrap: "nowrap",
    justifyContent: "space-between",
    backgroundColor: colors.lightGray,
    paddingVertical: 20
  },
  radioButtonBox: {
    borderWidth: 0
  },
  bottomPadding: {
    padding: 140
  },
  footer: {
    height: 100,
    flexDirection: "row",
    flexWrap: "nowrap",
    backgroundColor: colors.white
  }
} );

export {
  pickerSelectStyles,
  viewStyles
};
