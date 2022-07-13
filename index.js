// @flow

import "react-native-gesture-handler";
import "./src/i18n";

import inatjs from "inaturalistjs";
import { AppRegistry } from "react-native";
import Config from "react-native-config";
import { startNetworkLogging } from "react-native-network-logger";

import { name as appName } from "./app.json";
import App from "./src/navigation/rootNavigation";

startNetworkLogging();

// Configure inatjs to use the chosen URLs
inatjs.setConfig( {
  apiURL: Config.API_URL,
  writeApiURL: Config.API_URL
} );

AppRegistry.registerComponent( appName, ( ) => App );
