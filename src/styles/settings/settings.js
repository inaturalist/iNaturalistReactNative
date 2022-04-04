// @flow strict-local

import { StyleSheet } from "react-native";

import type {TextStyleProp, ViewStyleProp} from "react-native/Libraries/StyleSheet/StyleSheet";
import { colors } from "../global";

const viewStyles: { [string]: ViewStyleProp } = StyleSheet.create( {
  container: {
    backgroundColor: colors.white,
    display: "flex",
    flexDirection: "column",
    flexWrap: "nowrap",
    height: "100%"
  },
  tabsRow: {
    backgroundColor: colors.white,
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
    height: 75,
    justifyContent: "space-evenly"
  },
  headerRow: {
    backgroundColor: colors.white,
    flexDirection: "row",
    width: "100%",
    justifyContent: "flex-start",
    padding: 10
  },
  row: {
    display: "flex",
    flexDirection: "row"
  },
  column: {
    flexDirection: "column",
    justifyContent: "space-evenly"
  },
  saveSettings: {
  },
  profileImage: {
    height: 130,
    width: 130
  },
  textInput: {
    color: "#000000",
    borderWidth: 1,
    flexGrow: 1
  },
  notificationContainer: {
    marginBottom: 10
  },
  notificationLeftSide: {
    flex: 1
  },
  switch: {
    width: 50
  },
  notificationCheckbox: {
    alignItems: "center"
  },
  selectorContainer: {
    width: "100%",
    borderColor: "#000000",
    borderWidth: 1,
    borderStyle: "solid"
  },
  selector: {
    width: "100%"
  },
  placeResultContainer: {
    padding: 5,
    borderColor: "#CCCCCC",
    borderWidth: 1,
    borderStyle: "solid"
  },
  clearSearch: {
    width: 30,
    height: 30,
    alignSelf: "center"
  },
  revokeAccess: {
    width: 100,
    borderColor: "#CCCCCC",
    borderWidth: 1,
    borderStyle: "solid",
    marginRight: 10,
    flexDirection: "column",
    marginLeft: "auto",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  }
} );

const textStyles: { [string]: TextStyleProp } = StyleSheet.create( {
  header: {
    fontSize: 20,
    flexGrow: 1
  },
  activeTab: {
    fontWeight: "bold"
  },
  title: {
    fontSize: 20,
    marginBottom: 10
  },
  notificationTitle: {
    fontWeight: "bold"
  },
  subTitle: {
    fontWeight: "bold",
    marginTop: 10
  },
  marginTop: {
    marginTop: 10
  },
  resultPlaceName: {
    fontWeight: "bold"
  },
  resultPlaceType: {
    marginLeft: 10,
    color: "#CCCCCC"
  },
  checkbox: {
    flexWrap: "wrap",
    maxWidth: "90%"
  }

} );

export {
  viewStyles,
  textStyles
};
