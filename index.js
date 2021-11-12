// @flow

import "react-native-gesture-handler";

import {AppRegistry} from "react-native";
import inatjs from "inaturalistjs";
import App from "./navigation/stackNavigation";
import {name as appName} from "./app.json";

// import i18n (needs to be bundled)
import "./i18n";

inatjs.setConfig( {
  apiURL: "https://stagingapi.inaturalist.org/v2",
  writeApiURL: "https://stagingapi.inaturalist.org/v2"
} );

AppRegistry.registerComponent( appName, ( ) => App );
