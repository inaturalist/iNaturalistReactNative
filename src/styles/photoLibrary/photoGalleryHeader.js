// @flow strict-local

import { StyleSheet } from "react-native";
import type {
  TextStyleProp,
  ViewStyleProp
} from "react-native/Libraries/StyleSheet/StyleSheet";

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
  inputIOSContainer: pickerContainer,
  inputAndroidContainer: pickerContainer,
  // $FlowFixMe
  inputIOS: pickerText,
  // $FlowFixMe
  inputAndroid: pickerText
} );

const textStyles: { [string]: TextStyleProp } = StyleSheet.create( {

} );

export {
  textStyles,
  viewStyles
};
