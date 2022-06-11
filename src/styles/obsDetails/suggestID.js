// @flow strict-local

import { StyleSheet, Dimensions } from "react-native";

import type { ViewStyleProp, TextStyleProp, ImageStyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";
import { colors } from "../global";

const { width } = Dimensions.get( "screen" );

const viewStyles: { [string]: ViewStyleProp } = StyleSheet.create( {
  commentInputContainer: {
    position: "relative"
  },
  commentInput: {
    backgroundColor: colors.white,
    height: 150,
    padding: 0,
    margin: 10
  },
  commentInputText: {
    borderWidth: 1,
    borderColor: colors.gray,
    borderRadius: 10,
    paddingTop: 8,
    paddingBottom: 8,
    height: 150
  },
  commentClear: {
    position: "absolute",
    right: 20,
    bottom: 20,
    zIndex: 9999,
    width: 40,
    height: 20,
    color: colors.black
  },
  commentButtonContainer: {
    flexDirection: "row",
    flexWrap: "nowrap",
    width: "100%",
    justifyContent: "space-around",
    gap: 10
  },
  commentButton: {
    width: 150
  },
  commentContainer: {
    flexDirection: "row",
    flexWrap: "nowrap",
    width: width - 20,
    padding: 10,
    margin: 10,
    borderRadius: 10,
    backgroundColor: "#D9E5B8",
    alignItems: "center"
  },
  commentLeftIcon: {
    marginRight: 10,
    color: colors.inatGreen
  },
  commentRightIconContainer: {
    marginLeft: "auto"
  },
  commentRightIcon: {
    color: colors.inatGreen
  },
  taxonSearch: {
    marginLeft: 10,
    marginRight: 10
  },
  taxonList: {
    marginBottom: "auto",
    marginTop: 20,
    marginLeft: 10,
    marginRight: 10
  },
  taxonResult: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10
  },
  taxonResultIcon: {
    width: 50,
    height: 50,
    marginRight: 10
  },
  taxonResultNameContainer: {
    flexDirection: "column"
  },
  taxonResultInfo: {
    marginLeft: "auto",
    marginRight: 10
  },
  taxonResultInfoIcon: {
    color: colors.gray
  },
  taxonResultSelectIcon: {
    color: colors.inatGreen
  },
  taxonSearchIcon: {
    color: colors.gray
  }
} );

const textStyles: { [string]: TextStyleProp } = StyleSheet.create( {
  disabled: {
    color: colors.lightGray
  },
  taxonResultName: {
    fontWeight: "bold"
  },
  taxonResultScientificName: {
    color: colors.gray,
    fontStyle: "italic"
  }
} );

const imageStyles: { [string]: ImageStyleProp } = StyleSheet.create( {

} );

export {
  viewStyles,
  textStyles,
  imageStyles
};
