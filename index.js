// @flow

import {AppRegistry} from "react-native";
import ObsList from "./components/Observations/ObservationsList";
import {name as appName} from "./app.json";

AppRegistry.registerComponent( appName, () => ObsList );
