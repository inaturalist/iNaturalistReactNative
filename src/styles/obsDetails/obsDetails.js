// @flow

import { Dimensions, StyleSheet } from "react-native";
import type {
  ImageStyleProp,
  TextStyleProp,
  ViewStyleProp
} from "react-native/Libraries/StyleSheet/StyleSheet";
import colors from "styles/tailwindColors";

const { width } = Dimensions.get( "screen" );

const viewStyles: { [string]: ViewStyleProp } = StyleSheet.create( {
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
  rowBorder: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    marginHorizontal: 0,
    borderColor: colors.borderGray
  },
  buttons: {
    width: width / 2
  },
  button: {
    marginHorizontal: 5
  },
  favButton: {
    position: "absolute",
    top: 5,
    right: 0
  },
  rightSide: {
    width: 10,
    height: 10,
    marginLeft: "auto"
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
  dataTabSub: {
    marginLeft: 30,
    marginVertical: 0
  },
  dataTabView: {
    marginVertical: 10,
    marginLeft: 10
  },
  bottomModal: {
    padding: 0,
    backgroundColor: colors.white,
    shadowColor: "#000",
    borderTopStartRadius: 24,
    borderTopEndRadius: 24,
    shadowOffset: {
      width: 0,
      height: 12
    },
    shadowOpacity: 0.75,
    shadowRadius: 16.0,
    elevation: 24
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.0)"
  },
  centerRow: {
    alignItems: "center",
    justifyContent: "center"
  }
} );

const textStyles: { [string]: TextStyleProp } = StyleSheet.create( {
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
