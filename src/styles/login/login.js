// @flow strict-local

import { StyleSheet } from "react-native";
import { colors } from "../global";

import type {
  ViewStyleProp,
  TextStyleProp
} from "react-native/Libraries/StyleSheet/StyleSheet";

const viewStyles: { [string]: ViewStyleProp } = StyleSheet.create( {
  row: {
    flexDirection: "row",
    flexWrap: "nowrap",
    marginVertical: 10
  },
  containerStyle: {
    backgroundColor: colors.white,
    padding: 20,
    marginHorizontal: 20
  },
  greenButton: {
    backgroundColor: colors.inatGreen,
    borderRadius: 40,
    alignSelf: "center"
  },
  grayButton: {
    backgroundColor: colors.gray,
    borderRadius: 40,
    alignSelf: "center",
    marginRight: 20
  }
} );

const textStyles: { [string]: TextStyleProp } = StyleSheet.create( {
  text: {},
  error: {
    color: "#ff0000"
  },
  input: {
    color: "#000000",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10
  }
} );

export { viewStyles, textStyles };
