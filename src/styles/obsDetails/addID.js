// @flow strict-local
import { Dimensions, StyleSheet } from "react-native";
import type {
  ImageStyleProp,
  TextStyleProp,
  ViewStyleProp
} from "react-native/Libraries/StyleSheet/StyleSheet";
import colors from "styles/tailwindColors";

const { width } = Dimensions.get( "screen" );

const viewStyles: { [string]: ViewStyleProp } = StyleSheet.create( {
  headerRow: {
    flexDirection: "row",
    flexWrap: "nowrap",
    justifyContent: "space-between",
    padding: 10
  },
  commentInputContainer: {
    position: "relative"
  },
  commentInput: {
    backgroundColor: colors.white,
    height: 150,
    padding: 0,
    marginBottom: 20
  },
  commentInputText: {
    borderWidth: 1,
    borderColor: colors.darkGray,
    borderRadius: 10,
    paddingTop: 8,
    paddingBottom: 8,
    height: 150
  },
  bottomModal: {
    padding: 20
  },
  commentButtonContainer: {
    flexDirection: "row",
    flexWrap: "nowrap",
    width: "100%",
    justifyContent: "space-around"
  },
  commentButton: {
    width: 150
  },
  commentContainer: {
    flexDirection: "row",
    flexWrap: "nowrap",
    width: width - 40,
    padding: 10,
    marginTop: 10,
    marginBottom: 20,
    borderRadius: 10,
    backgroundColor: "#D9E5B8",
    alignItems: "center"
  },
  commentRightIconContainer: {
    marginLeft: "auto"
  },
  taxonSearch: {
    marginTop: 10
  },
  commentClear: {
    position: "absolute",
    right: 20,
    bottom: 30,
    zIndex: 9999,
    width: 40,
    height: 20
  }
} );

const textStyles: { [string]: TextStyleProp } = StyleSheet.create( {
  disabled: {
    color: colors.lightGray
  },
  commentHeader: {
    fontSize: 22,
    marginBottom: 10
  },
  taxonSearchIcon: {
    color: colors.darkGray
  },
  taxonResultInfoIcon: {
    color: colors.darkGray
  },
  taxonResultSelectIcon: {
    color: colors.inatGreen
  },
  commentClearText: {
    color: colors.black
  },
  commentLeftIcon: {
    marginRight: 10,
    color: colors.inatGreen
  },
  commentRightIcon: {
    color: colors.inatGreen
  }
} );

const imageStyles: { [string]: ImageStyleProp } = StyleSheet.create( {

} );

export {
  imageStyles,
  textStyles,
  viewStyles
};
