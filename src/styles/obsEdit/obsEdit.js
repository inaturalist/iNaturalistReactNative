// @flow strict-local

import { Dimensions, StyleSheet } from "react-native";
import type {
  ImageStyleProp,
  TextStyleProp,
  ViewStyleProp
} from "react-native/Libraries/StyleSheet/StyleSheet";
import colors from "styles/colors";

const { width } = Dimensions.get( "screen" );

const pickerContainer = {
  paddingHorizontal: 10
};

const pickerText = {

};

const pickerSelectStyles: { [string]: TextStyleProp } = StyleSheet.create( {
  inputIOS: pickerText,
  inputAndroid: pickerText,
  inputIOSContainer: pickerContainer,
  inputAndroidContainer: pickerContainer
} );

const textStyles: { [string]: TextStyleProp } = StyleSheet.create( {
  headerText: {
    marginHorizontal: 20
  },
  text: {
    marginHorizontal: 20
  },
  smallLabel: {
    fontSize: 11
  },
  verticalCenter: {
    lineHeight: 0
  },
  evidenceCancel: {
    marginTop: 20,
    textDecorationLine: "underline"
  },
  evidenceWarning: {
    marginBottom: 10,
    marginTop: 10,
    textAlign: "center"
  }
} );

const imageWidth = 66;
const smallImageWidth = imageWidth - 40;

const imageStyles: { [string]: ImageStyleProp } = StyleSheet.create( {
  obsPhoto: {
    width: imageWidth,
    height: imageWidth,
    borderRadius: 8,
    marginHorizontal: 6,
    marginVertical: 27
  },
  smallPhoto: {
    width: smallImageWidth,
    height: smallImageWidth,
    marginVertical: 40,
    borderRadius: 10,
    marginHorizontal: 5
  }
} );

const viewStyles: { [string]: ViewStyleProp } = StyleSheet.create( {
  addEvidenceBottomSheet: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: 20
  },
  evidenceButtonsContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: 300,
    marginTop: 20
  },
  headerRow: {
    height: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20
  },
  caret: {
    width: 35
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
  noMargin: {
    margin: 0
  },
  greenSelectionBorder: {
    borderWidth: 3,
    borderColor: colors.selectionGreen
  },
  iconicTaxaButtons: {
    marginHorizontal: 20,
    marginVertical: 20
  },
  row: {
    flexDirection: "row",
    flexWrap: "nowrap",
    marginVertical: 10
  },
  multipleObsRow: {
    flexDirection: "row",
    flexWrap: "nowrap",
    alignItems: "center"
  },
  buttonRow: {
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "space-evenly"
  },
  evidenceList: {
    marginBottom: 20
  },
  evidenceButton: {
    backgroundColor: colors.inatGreen,
    width: imageWidth,
    height: imageWidth,
    borderRadius: 20,
    marginHorizontal: 20,
    marginVertical: 20
  },
  soundButton: {
    backgroundColor: colors.gray,
    width: imageWidth,
    height: imageWidth,
    borderRadius: 20,
    marginHorizontal: 20,
    marginVertical: 20
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
  imageStyles,
  pickerSelectStyles,
  textStyles,
  viewStyles
};
