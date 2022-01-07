// @flow strict-local

import { StyleSheet } from "react-native";

import type { TextStyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";

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

export {
  pickerSelectStyles
};
