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
    marginHorizontal: 10
  },
  obsDetailsColumn: {
    width: 200,
    justifyContent: "center"
  },
  photoContainer: {
    backgroundColor: colors.black,
    height: 200,
    position: "relative"
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
  favButton: {
    position: "absolute",
    top: 5,
    right: 0
  },
  userIcon: {
    flexDirection: "row",
    flexWrap: "nowrap",
    alignItems: "center",
    marginHorizontal: 13,
    marginVertical: 5
  },
  rightSide: {
    width: 10,
    height: 10,
    marginLeft: "auto"
  },
  activityItem: {
    paddingRight: 0
  },
  labels: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "nowrap",
    alignItems: "center",
    justifyContent: "flex-end",
    marginLeft: "auto",
    width: 100,
    paddingRight: 1
  },
  kebabMenuWrapper: {
    marginLeft: 15,
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: 30,
    right: 0
  },
  kebabMenuIconContainer: {
    width: 30
  },
  kebabMenuIcon: {
    width: 30,
    paddingRight: 30
  },
  kebabMenuPlacement: {
    top: 0,
    left: -100,
    position: "absolute",
    minWidth: 200
  },
  textPadding: {
    paddingRight: 30
  },

  rowWithIcon: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center"
  },
  tabContainer: {
    width: "50%",
    display: "flex",
    alignItems: "center",
    flexDirection: "column"
  },
  tabContainerActive: {
    borderTopColor: colors.inatGreen,
    borderTopWidth: 5,
    borderTopStartRadius: 5,
    borderTopEndRadius: 5,
    width: "100%"
  },
  locationContainer: {
    paddingLeft: 10
  },
  labelsContainer: {
    display: "flex",
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end"
  },
  dataTabSub: {
    marginLeft: 30,
    marginVertical: 0
  },
  dataTabView: {
    marginVertical: 10,
    marginLeft: 10
  }
} );

const textStyles: { [string]: TextStyleProp } = StyleSheet.create( {
  idCommentCount: {
    marginLeft: 5
  },
  locationText: {
    marginLeft: 5,
    color: colors.logInGray
  },
  tabText: {
    color: colors.gray,
    fontSize: 20,
    paddingTop: 10,
    paddingBottom: 10,
    fontWeight: "bold"
  },
  tabTextActive: {
    color: colors.inatGreen
  },
  commonNameText: {
    fontSize: 18
  },
  scientificNameText: {
    color: colors.logInGray,
    fontStyle: "italic"
  },
  whiteText: {
    color: colors.white
  },
  dataTabText: {
    marginVertical: 10,
    marginLeft: 10,
    color: colors.logInGray
  },
  favText: {
    fontSize: 25
  },
  dataTabDateHeader: {
    marginVertical: 10,
    marginBottom: 0
  },
  dataTabSubText: {
    marginLeft: 30,
    marginVertical: 0
  },
  dataTabHeader: {
    marginVertical: 10,
    fontWeight: "bold",
    fontSize: 15,
    marginLeft: 10
  },
  labels: {
    marginRight: 5,
    fontSize: 12
  },
  observedOn: {
    color: colors.logInGray,
    fontSize: 12
  },
  username: {
    color: colors.logInGray,
    fontSize: 12
  },
  activityCategory: {
    color: colors.inatGreen,
    fontSize: 12
  },
  activityItemBody: {
    color: colors.logInGray
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
    marginRight: 10
  },
  smallGreenIcon: {
    width: 20,
    height: 20,
    tintColor: colors.inatGreen,
    marginRight: 5
  },
  smallIcon: {
    width: 15,
    height: 15,
    tintColor: colors.logInGray
  }
} );

export {
  imageStyles,
  textStyles,
  viewStyles
};
