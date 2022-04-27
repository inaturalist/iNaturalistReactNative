// @flow strict-local

import { StyleSheet } from "react-native";

import type { TextStyleProp, ImageStyleProp, ViewStyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";
import { colors } from "../global";

const pickerContainer = {
  paddingHorizontal: 10
};

const pickerText = {

};

const pickerSelectStyles: { [string]: TextStyleProp } = StyleSheet.create( {
  inputIOS: pickerText,
  inputAndroid: pickerText,
  inputIOSContainer: pickerContainer,
  inputAndroidContainer: pickerContainer
} );

const textStyles: { [string]: TextStyleProp } = StyleSheet.create( {
  headerText: {
    marginHorizontal: 20
  },
  text: {
    marginHorizontal: 20
  },
  notes: {
    marginHorizontal: 20
  },
  smallLabel: {
    fontSize: 11
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
  noMargin: {
    margin: 0
  },
  saveButton: {
    width: 100
  },
  greenSelectionBorder: {
    borderWidth: 5,
    borderColor: colors.inatGreen
  },
  iconicTaxaButtons: {
    marginHorizontal: 20,
    marginVertical: 20
  },
  row: {
    flexDirection: "row",
    flexWrap: "nowrap",
    marginVertical: 10
  },
  evidenceList: {
    marginBottom: 20
  },
  evidenceButton: {
    backgroundColor: colors.inatGreen,
    width: imageWidth,
    height: imageWidth,
    borderRadius: 20,
    marginHorizontal: 20,
    marginVertical: 20
  },
  soundButton: {
    backgroundColor: colors.gray,
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
  imageStyles,
  viewStyles
};
