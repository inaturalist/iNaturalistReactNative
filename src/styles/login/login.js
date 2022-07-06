// @flow strict-local

import { StyleSheet } from "react-native";
import { colors } from "../global";

import type {
  ViewStyleProp,
  TextStyleProp, ImageStyleProp
} from "react-native/Libraries/StyleSheet/StyleSheet";

const viewStyles: { [string]: ViewStyleProp } = StyleSheet.create( {
  container: {
    flex: 1
  },
  paddedContainer: {
    flex: 1,
    padding: "10%",
    justifyContent: "center"
  },
  greenButton: {
    backgroundColor: colors.inatGreen,
    borderRadius: 40,
    alignSelf: "center"
  },
  grayButton: {
    backgroundColor: colors.gray,
    borderRadius: 40,
    alignSelf: "center",
    marginRight: 20
  },
  input: {
    height: 50
  },
  button: {
    width: 200,
    height: 50,
    alignSelf: "center",
    marginTop: 30,
    justifyContent: "center"
  },
  logoutForm: {
    alignItems: "center"
  }
} );

const textStyles: { [string]: TextStyleProp } = StyleSheet.create( {
  header: {
    fontSize: 27,
    alignSelf: "center",
    marginTop: 10
  },
  subtitle: {
    fontSize: 20,
    alignSelf: "center",
    marginTop: 20,
    marginBottom: 20,
    textAlign: "center"
  },
  fieldText: {
    fontSize: 17,
    marginBottom: 5,
    marginTop: 10
  },
  error: {
    color: colors.red,
    marginTop: 20,
    textAlign: "center"
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginTop: 10,
    textDecorationLine: "underline"
  }
} );

const imageStyles: { [string]: ImageStyleProp } = StyleSheet.create( {
  logo: {
    width: 150,
    height: 150,
    alignSelf: "center"
  }

} );


export { viewStyles, textStyles, imageStyles };
