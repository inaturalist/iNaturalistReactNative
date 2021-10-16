// @flow

import "react-native-gesture-handler";

import {AppRegistry} from "react-native";
import inatjs from "inaturalistjs";
import App from "./navigation/stackNavigation";
// import ObsList from "./components/Observations/ObservationsList";
import {name as appName} from "./app.json";

inatjs.setConfig( {
  apiURL: "https://api.inaturalist.org/v2",
  writeApiURL: "https://api.inaturalist.org/v2"
} );

// AppRegistry.registerComponent( appName, () => ObsList );


AppRegistry.registerComponent( appName, ( ) => App );
