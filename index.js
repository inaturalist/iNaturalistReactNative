// @flow

import {AppRegistry} from "react-native";
import ObsList from "./components/Observations/ObservationsList";
import {name as appName} from "./app.json";

// import { Database } from "@nozbe/watermelondb";
// import SQLiteAdapter from "@nozbe/watermelondb/adapters/sqlite";

// import schema from "./model/schema";
// import migrations from "./model/migrations";
// import Observations from "./model/Observations";

// // First, create the adapter to the underlying database:
// const adapter = new SQLiteAdapter( {
//   schema,
//   // (You might want to comment it out for development purposes -- see Migrations documentation)
//   // migrations,
//   // (optional database name or file system path)
//   // dbName: 'myapp',
//   // (recommended option, should work flawlessly out of the box on iOS. On Android,
//   // additional installation steps have to be taken - disable if you run into issues...)
//   jsi: true, /* Platform.OS === 'ios' */
//   // (optional, but you should implement this method)
//   onSetUpError: error => {
//     // Database failed to load -- offer the user to reload the app or log out
//   }
// } );

// Then, make a Watermelon database from it!
// const database = new Database( {
//   adapter,
//   modelClasses: [
//     Observations
//   ]
// } );

AppRegistry.registerComponent( appName, () => ObsList );

// export default database;
