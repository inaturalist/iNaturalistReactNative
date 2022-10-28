// @flow strict-local

import { Dimensions, StyleSheet } from "react-native";
import type {
  TextStyleProp,
  ViewStyleProp
} from "react-native/Libraries/StyleSheet/StyleSheet";

import colors from "../../../tailwind-colors";

const { width } = Dimensions.get( "screen" );

const textStyles: { [string]: TextStyleProp } = StyleSheet.create( {
  text: {
    marginHorizontal: 20
  },
  evidenceWarning: {
    marginBottom: 10,
    marginTop: 10,
    textAlign: "center"
  }
} );

const viewStyles: { [string]: ViewStyleProp } = StyleSheet.create( {
  editIcon: {
    backgroundColor: colors.white
  },
  headerRow: {
    height: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20
  },
  bottomModal: {
    backgroundColor: colors.white,
    borderTopRightRadius: 30,
    borderTopLeftRadius: 30,
    borderColor: colors.gray,
    borderWidth: 1,
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    position: "absolute",
    bottom: 0,
    width: "100%"
  },
  greenSelectionBorder: {
    borderWidth: 3,
    borderColor: colors.selectionGreen
  },
  row: {
    flexDirection: "row",
    flexWrap: "nowrap",
    marginVertical: 10
  },
  buttonRow: {
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "space-evenly"
  },
  evidenceList: {
    marginBottom: 20
  },
  selected: {
    backgroundColor: colors.inatGreen
  },
  photoContainer: {
    backgroundColor: colors.black,
    height: 125,
    width
  },
  container: {
    backgroundColor: colors.black
  },
  mediaViewerSafeAreaView: {
    backgroundColor: colors.black
  },
  button: {
    marginHorizontal: 40
  }
} );

export {
  textStyles,
  viewStyles
};
