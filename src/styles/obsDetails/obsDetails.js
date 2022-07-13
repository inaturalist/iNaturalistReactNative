// @flow strict-local

import { Dimensions, StyleSheet } from "react-native";
import type {
  ImageStyleProp,
  TextStyleProp,
  ViewStyleProp
} from "react-native/Libraries/StyleSheet/StyleSheet";

import colors from "../colors";

const { width } = Dimensions.get( "screen" );

const viewStyles: { [string]: ViewStyleProp } = StyleSheet.create( {
  temporaryRow: {
    opacity: 0.5
  },
  hoverCommentBox: {
    zIndex: 1
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
    paddingBottom: 400
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
    marginHorizontal: 13,
    marginVertical: 5
  },
  rowBorder: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    marginHorizontal: 0,
    borderColor: colors.borderGray
  },
  button: {
    width: width / 2
  },
  pressableButton: {
    paddingVertical: 10,
    paddingHorizontal: 20
  },
  userIcon: {
    flexDirection: "row",
    flexWrap: "nowrap",
    alignItems: "center",
    marginHorizontal: 13,
    marginVertical: 5
  },
  labels: {
    flexDirection: "row",
    flexWrap: "nowrap",
    alignItems: "center",
    position: "absolute",
    right: 0
  },
  kebabMenuWrapper: {
    margin: 15,
    flex: 1,
    backgroundColor: "white"
  },
  kebabMenuPlacement: {
    top: 0,
    left: -100,
    position: "absolute",
    minWidth: 200
  },
  textPadding: {
    paddingRight: 30
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
  },
  whiteText: {
    color: colors.white
  },
  dataTabText: {
    marginVertical: 10
  },
  labels: {
    marginRight: 5
  }
} );

const imageStyles: { [string]: ImageStyleProp } = StyleSheet.create( {
  userProfileIcon: {
    width: 30,
    height: 30,
    borderRadius: 50,
    borderColor: colors.black,
    borderWidth: 0.5,
    marginRight: 10
  },
  largeIcon: {
    width: 100,
    height: 100
  },
  squareImage: {
    width: 47,
    height: 47,
    borderRadius: 10,
    marginRight: 18
  }
} );

export {
  imageStyles,
  textStyles,
  viewStyles
};
