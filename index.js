// @flow


// This needs to be the first imported module so that
// fbt works in static contexts.
import "./i18n/fbtInit";
import "react-native-gesture-handler";

import {AppRegistry} from "react-native";
import inatjs from "inaturalistjs";
import App from "./src/navigation/stackNavigation";
import {name as appName} from "./app.json";

inatjs.setConfig( {
  apiURL: "https://stagingapi.inaturalist.org/v2",
  writeApiURL: "https://stagingapi.inaturalist.org/v2"
} );

AppRegistry.registerComponent( appName, ( ) => App );
