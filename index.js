// @flow

import "react-native-gesture-handler";

import { AppRegistry } from "react-native";
import inatjs from "inaturalistjs";
import Config from "react-native-config";
import App from "./src/navigation/rootNavigation";
import {name as appName} from "./app.json";
import "./src/i18n";
import { startNetworkLogging } from "react-native-network-logger";

startNetworkLogging();

// Configure inatjs to use the chosen URLs
inatjs.setConfig( {
  apiURL: Config.API_URL,
  writeApiURL: Config.API_URL
} );

AppRegistry.registerComponent( appName, ( ) => App );
