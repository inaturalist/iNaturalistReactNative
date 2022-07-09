// @flow strict-local

import { StyleSheet } from "react-native";

import type {
  ViewStyleProp,
  TextStyleProp,
  ImageStyleProp
} from "react-native/Libraries/StyleSheet/StyleSheet";

const viewStyles: { [string]: ViewStyleProp } = StyleSheet.create( {
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 70
  },
  recordButtonRow: {
    flexDirection: "row",
    flexWrap: "nowrap",
    alignItems: "center",
    justifyContent: "space-between"
  },
  playbackButton: {
    marginRight: 30
  }
} );

const textStyles: { [string]: TextStyleProp } = StyleSheet.create( {
  alignCenter: {
    textAlign: "center"
  },
  duration: {
    marginTop: 20,
    fontSize: 40
  }
} );

const imageStyles: { [string]: ImageStyleProp } = StyleSheet.create( {

} );

export {
  viewStyles,
  textStyles,
  imageStyles
};
