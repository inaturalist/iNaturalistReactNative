// @flow strict-local

import { StyleSheet } from "react-native";
import type {
  ImageStyleProp,
  TextStyleProp, ViewStyleProp
} from "react-native/Libraries/StyleSheet/StyleSheet";

const viewStyles: { [string]: ViewStyleProp } = StyleSheet.create( {
  paddedContainer: {
    flex: 1,
    padding: "10%",
    justifyContent: "center"
  },
  input: {
    height: 50
  },
  button: {
    marginTop: 30
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
  forgotPassword: {
    alignSelf: "flex-end",
    marginTop: 10
  }
} );

const imageStyles: { [string]: ImageStyleProp } = StyleSheet.create( {
  logo: {
    width: 150,
    height: 150,
    alignSelf: "center"
  }

} );

const closeButton: { [string]: ViewStyleProp } = StyleSheet.create( {
  close: {
    position: "absolute",
    top: 20,
    end: 20
  }
} );

export {
  closeButton, imageStyles, textStyles, viewStyles
};
