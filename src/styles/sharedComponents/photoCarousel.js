// @flow strict-local

import { Dimensions, StyleSheet } from "react-native";
import type { ImageStyleProp, ViewStyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";

import colors from "../colors";

const { width } = Dimensions.get( "screen" );

const imageWidth = 66;

const standardCameraImage = {
  backgroundColor: colors.midGray,
  width: imageWidth,
  height: imageWidth,
  borderRadius: 8,
  marginHorizontal: 6,
  marginVertical: 27,
  marginTop: 50,
  marginBottom: 18,
  justifyContent: "center"
};

const imageStyles: { [string]: ImageStyleProp } = StyleSheet.create( {
  photo: {
    width: imageWidth,
    height: imageWidth,
    borderRadius: 8,
    marginHorizontal: 6,
    marginVertical: 27
  },
  photoStandardCamera: standardCameraImage
} );

const viewStyles: { [string]: ViewStyleProp } = StyleSheet.create( {
  addEvidenceButton: {
    width: imageWidth,
    height: imageWidth,
    borderWidth: 2,
    borderColor: colors.logInGray,
    borderRadius: 8,
    marginHorizontal: 6,
    marginVertical: 27,
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  photoContainer: {
    top: 50,
    minWidth: width
  },
  // $FlowIgnore
  photoLoading: standardCameraImage,
  greenSelectionBorder: {
    borderWidth: 3,
    borderColor: colors.selectionGreen
  },
  deleteButton: {
    paddingHorizontal: 10,
    left: 45,
    top: -100,
    paddingVertical: 10
  }
} );

export {
  imageStyles,
  viewStyles
};
