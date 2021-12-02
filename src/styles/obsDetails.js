// @flow strict-local

import { StyleSheet } from "react-native";

import type { ViewStyleProp, TextStyleProp, ImageStyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";
import { colors } from "./global";

const viewStyles: { [string]: ViewStyleProp } = StyleSheet.create( {
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
  photoContainer: {
    backgroundColor: colors.black,
    height: 200
  },
  row: {
    flexDirection: "row",
    flexWrap: "nowrap",
    marginVertical: 10
  },
  scrollView: {
    paddingBottom: 100
  },
  speciesDetailRow: {
    flexDirection: "row",
    flexWrap: "nowrap",
    alignItems: "center",
    justifyContent: "flex-start",
    marginHorizontal: 10,
    marginVertical: 5
  },
  userProfileRow: {
    flexDirection: "row",
    flexWrap: "nowrap",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 10,
    marginVertical: 5
  }
} );

const textStyles: { [string]: TextStyleProp } = StyleSheet.create( {
  locationText: {
    marginLeft: 20
  },
  greenButtonText: {
    color: colors.inatGreen,
    fontSize: 15,
    marginHorizontal: 40,
    textDecorationLine: "underline"
  },
  commonNameText: {
    fontSize: 15
  },
  scientificNameText: {
    color: colors.gray
  }
} );

const imageStyles: { [string]: ImageStyleProp } = StyleSheet.create( {
  userProfileIcon: {
    width: 32,
    height: 32,
    borderRadius: 50,
    borderColor: colors.black,
    borderWidth: 0.5
  },
  largeIcon: {
    width: 100,
    height: 100
  },
  squareImage: {
    width: 50,
    height: 50,
    borderRadius: 10,
    marginHorizontal: 20
  }
} );

export {
  viewStyles,
  textStyles,
  imageStyles
};
