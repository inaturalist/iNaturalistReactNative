// @flow

import "react-native-gesture-handler";

import {AppRegistry} from "react-native";
import inatjs from "inaturalistjs";
import App from "./src/navigation/rootNavigation";
import {name as appName} from "./app.json";

inatjs.setConfig( {
  apiURL: "https://stagingapi.inaturalist.org/v2",
  writeApiURL: "https://stagingapi.inaturalist.org/v2"
} );

// inatjs.setConfig( {
//   apiURL: "https://api.inaturalist.org/v2",
//   writeApiURL: "https://api.inaturalist.org/v2"
// } );

AppRegistry.registerComponent( appName, ( ) => App );
