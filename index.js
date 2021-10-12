import { AppRegistry } from "react-native";
import { name as appName } from "./app.json";
import App from "./navigation/stackNavigation";

AppRegistry.registerComponent( appName, () => App );
