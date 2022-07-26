// @flow strict-local

import { Dimensions, StyleSheet } from "react-native";
import type { TextStyleProp, ViewStyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";

import colors from "../../colors";

const { width, height } = Dimensions.get( "screen" );

const imageWidth = width / 2 - 20;

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
  iconRow: {
    flexDirection: "row",
    flexWrap: "nowrap",
    alignItems: "center"
  },
  photoContainer: {
    backgroundColor: colors.black,
    height: 200
  },
  photoStatRow: {
    flexDirection: "row",
    flexWrap: "nowrap",
    justifyContent: "space-between",
    position: "absolute",
    bottom: 80,
    width: imageWidth,
    backgroundColor: colors.white
  }
} );

const textStyles: { [string]: TextStyleProp } = StyleSheet.create( {
} );

export {
  textStyles,
  viewStyles
};
