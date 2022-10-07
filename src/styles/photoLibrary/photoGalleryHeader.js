// @flow strict-local

import { StyleSheet } from "react-native";
import type {
  TextStyleProp,
  ViewStyleProp
} from "react-native/Libraries/StyleSheet/StyleSheet";
import colors from "styles/colors";

const pickerContainer = {
  alignItems: "center",
  flexDirection: "row",
  flexWrap: "nowrap",
  paddingHorizontal: 30
};

const pickerText = {
  fontSize: 20,
  marginTop: 20
};

const viewStyles: { [string]: ViewStyleProp } = StyleSheet.create( {
  header: {
    height: 70,
    flexDirection: "row",
    flexWrap: "nowrap",
    alignItems: "center"
  },
  inputIOSContainer: pickerContainer,
  inputAndroidContainer: pickerContainer,
  // $FlowFixMe
  inputIOS: pickerText,
  // $FlowFixMe
  inputAndroid: pickerText
} );

const textStyles: { [string]: TextStyleProp } = StyleSheet.create( {
  header: {
    marginLeft: 10
  },
  text: {
    margin: 10
  },
  disabled: {
    color: colors.lightGray
  }
} );

export {
  textStyles,
  viewStyles
};
