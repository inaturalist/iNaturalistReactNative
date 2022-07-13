// @flow strict-local

import { Dimensions, StyleSheet } from "react-native";
import type { TextStyleProp, ViewStyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";

const { width } = Dimensions.get( "screen" );

const viewStyles: { [string]: ViewStyleProp } = StyleSheet.create( {
  row: {
    flexDirection: "row",
    flexWrap: "nowrap",
    marginVertical: 10,
    marginHorizontal: 10,
    justifyContent: "space-between"
  },
  button: {
    width: width / 2
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20
  },
  countRow: {
    flexDirection: "row"
  },
  countBox: {
    width: width / 4,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderRightWidth: 1
  }
} );

const textStyles: { [string]: TextStyleProp } = StyleSheet.create( {
  text: {
    textAlign: "center"
  }
} );

export {
  textStyles,
  viewStyles
};
