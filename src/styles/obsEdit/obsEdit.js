// @flow strict-local

import { StyleSheet } from "react-native";

import type { TextStyleProp, ImageStyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";
import { colors } from "../global";

const pickerContainer = {
  alignItems: "center",
  flexDirection: "row",
  flexWrap: "nowrap",
  paddingHorizontal: 30
};

const pickerText = {
  borderRadius: 10,
  fontSize: 16,
  paddingVertical: 12,
  paddingHorizontal: 10,
  color: colors.white,
  backgroundColor: colors.gray
};

const pickerSelectStyles: { [string]: TextStyleProp } = StyleSheet.create( {
  inputIOS: pickerText,
  inputAndroid: pickerText,
  inputIOSContainer: pickerContainer,
  inputAndroidContainer: pickerContainer
} );

const textStyles: { [string]: TextStyleProp } = StyleSheet.create( {
  headerText: {
    fontSize: 20,
    color: colors.white,
    backgroundColor: colors.gray,
    marginHorizontal: 20,
    marginTop: 20
  },
  text: {
    marginHorizontal: 20
  },
  notes: {
    marginHorizontal: 20,
    height: 75,
    borderColor: colors.gray,
    borderWidth: 1,
    borderRadius: 10,
    marginTop: 20,
    marginBottom: 10
  }
} );

const imageWidth = 100;

const imageStyles: { [string]: ImageStyleProp } = StyleSheet.create( {
  obsPhoto: {
    width: imageWidth,
    height: imageWidth,
    borderRadius: 20,
    marginHorizontal: 20,
    marginVertical: 20
  }
} );

export {
  pickerSelectStyles,
  textStyles,
  imageStyles
};
