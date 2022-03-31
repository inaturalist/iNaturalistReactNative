// @flow

import "react-native-gesture-handler";

import { AppRegistry, Alert } from "react-native";
import inatjs from "inaturalistjs";
import App from "./src/navigation/rootNavigation";
import {name as appName} from "./app.json";
import "./src/i18n";
import { startNetworkLogging } from "react-native-network-logger";
import { setJSExceptionHandler } from "react-native-exception-handler";

// https://github.com/a7ul/react-native-exception-handler-example/blob/7c8f32d53856db1cc10f968c58034b285926951b/App.js
const errorHandler = ( e, isFatal ) => {
  if ( isFatal ) {
    Alert.alert(
        "Unexpected error occurred",
        `
        Error: ${( isFatal ) ? "Fatal:" : ""} ${e.name} ${e.message}! Please close the app and start again!
        `,
      [{
        text: "Close"
      }]
    );
  }
  console.log( e ); // So that we can see it in the ADB logs in case of Android if needed
};

setJSExceptionHandler( errorHandler, true );

//For most use cases:
// setNativeExceptionHandler( ( exceptionString ) => {
//   console.log( exceptionString, "exception string native" );
//   // alert( exceptionString );
//   Alert.alert(
//     "",
//     exceptionString
//   );
// } );

startNetworkLogging();

// inatjs.setConfig( {
//   apiURL: "https://stagingapi.inaturalist.org/v1",
//   writeApiURL: "https://stagingapi.inaturalist.org/v1"
// } );

inatjs.setConfig( {
  apiURL: "https://stagingapi.inaturalist.org/v2",
  writeApiURL: "https://stagingapi.inaturalist.org/v2"
} );

// inatjs.setConfig( {
//   apiURL: "https://api.inaturalist.org/v2",
//   writeApiURL: "https://api.inaturalist.org/v2"
// } );

// inatjs.setConfig( {
//   apiURL: "https://api.inaturalist.org/v1",
//   writeApiURL: "https://api.inaturalist.org/v1"
// } );

AppRegistry.registerComponent( appName, ( ) => App );
