// @flow

import "react-native-gesture-handler";
import Config from "react-native-config";
import inatjs from "inaturalistjs";
import { AppRegistry } from "react-native";
import { startNetworkLogging } from "react-native-network-logger";

import App from "./src/navigation/rootNavigation";
import { name as appName } from "./app.json";
import "./src/i18n";

startNetworkLogging();

// Configure inatjs to use the chosen URLs
inatjs.setConfig( {
  apiURL: Config.API_URL,
  writeApiURL: Config.API_URL
} );

AppRegistry.registerComponent( appName, ( ) => App );
