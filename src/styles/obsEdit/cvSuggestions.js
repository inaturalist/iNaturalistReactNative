// @flow strict-local

import { StyleSheet, Dimensions } from "react-native";

import type { ViewStyleProp, TextStyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";
import { colors } from "../global";

const { width } = Dimensions.get( "screen" );

const viewStyles: { [string]: ViewStyleProp } = StyleSheet.create( {
  imageBackground: {
    width: 75,
    height: 75,
    borderRadius: 10,
    backgroundColor: colors.black,
    marginHorizontal: 20
  },
  obsDetailsColumn: {
    width: width / 3
  },
  row: {
    flexDirection: "row",
    flexWrap: "nowrap",
    marginVertical: 10
  },
  searchBar: {
    marginHorizontal: 10
  }
} );

const textStyles: { [string]: TextStyleProp } = StyleSheet.create( {
  text: { },
  greenText: {
    color: colors.inatGreen
  },
  explainerText: {
    marginHorizontal: 20,
    marginBottom: 20
  }
} );

export {
  viewStyles,
  textStyles
};
