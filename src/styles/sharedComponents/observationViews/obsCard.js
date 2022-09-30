// @flow strict-local

import { Dimensions, StyleSheet } from "react-native";
import type { TextStyleProp, ViewStyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";

import colors from "../../colors";

const { height } = Dimensions.get( "screen" );

const viewStyles: { [string]: ViewStyleProp } = StyleSheet.create( {
  icon: {
    marginRight: 5
  },
  center: {
    top: height / 3,
    alignItems: "center"
  },
  imageBackground: {
    width: 75,
    height: 75,
    borderRadius: 10,
    backgroundColor: colors.black,
    marginHorizontal: 20
  },
  obsDetailsColumn: {
    width: 200
  },
  row: {
    flexDirection: "row",
    flexWrap: "nowrap",
    marginVertical: 10
  },
  photoContainer: {
    backgroundColor: colors.black,
    height: 200
  }
} );

const textStyles: { [string]: TextStyleProp } = StyleSheet.create( {
} );

export {
  textStyles,
  viewStyles
};
