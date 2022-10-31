// @flow

import colors from "colors";
import { StyleSheet } from "react-native";
import type { TextStyleProp, ViewStyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";

const viewStyles: { [string]: ViewStyleProp } = StyleSheet.create( {
  container: {
    backgroundColor: colors.white,
    display: "flex",
    flexDirection: "column",
    flexWrap: "nowrap",
    height: "auto",
    paddingBottom: 200
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
    paddingBottom: 200
  },
  profileImage: {
    height: 130,
    width: 130
  },
  relationshipImage: {
    height: 60,
    width: 60
  },
  textInput: {
    backgroundColor: colors.white,
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
  },
  relationshipRow: {
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#CCCCCC",
    paddingBottom: 10
  },
  removeRelationship: {
    width: 100,
    borderColor: "#CCCCCC",
    borderWidth: 1,
    borderStyle: "solid",
    flexDirection: "column",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  paginationContainer: {
    marginTop: 20,
    marginBottom: 20,
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  pageButton: {
    width: 30,
    borderColor: "#CCCCCC",
    borderWidth: 1,
    borderStyle: "solid",
    flexDirection: "column",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10
  },
  userPic: {
    width: 30,
    height: 30,
    alignSelf: "center"
  },
  applicationRow: {
    marginTop: 20
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
  },
  currentPage: {
    fontWeight: "bold"
  },
  applicationName: {
    flex: 1
  }
} );

export {
  textStyles,
  viewStyles
};
