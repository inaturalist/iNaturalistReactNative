// @flow

import colors from "colors";
import { StyleSheet } from "react-native";
import type {
  ImageStyleProp,
  TextStyleProp,
  ViewStyleProp
} from "react-native/Libraries/StyleSheet/StyleSheet";

const viewStyles: { [string]: ViewStyleProp } = StyleSheet.create( {
  dropdown: {
    backgroundColor: colors.white,
    borderColor: colors.gray,
    borderRadius: 40,
    borderWidth: 0.5,
    height: 37,
    paddingLeft: 15,
    marginVertical: 5
  },
  positionBottom: {
    bottom: 140,
    width: "100%",
    position: "absolute"
  },
  bottomCard: {
    backgroundColor: colors.white,
    borderTopRightRadius: 30,
    borderTopLeftRadius: 30,
    borderColor: colors.gray,
    borderWidth: 1,
    paddingTop: 20,
    paddingBottom: 70,
    paddingHorizontal: 20
  },
  button: {
    marginHorizontal: 120
  }
} );

const textStyles: { [string]: TextStyleProp } = StyleSheet.create( {
  explanation: {
    color: colors.gray,
    margin: 10
  }
} );

const imageStyles: { [string]: ImageStyleProp } = StyleSheet.create( {
  circularPickerIcon: {
    width: 25,
    height: 25,
    borderRadius: 50
  },
  pickerIcon: {
    width: 25,
    height: 25
  }
} );

export {
  imageStyles,
  textStyles,
  viewStyles
};
