// @flow

import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import DrawerNavigator from "./drawerNavigation";

const Stack = createNativeStackNavigator( );

const App = ( ): React.Node => (
  <NavigationContainer>
    <Stack.Navigator>
      <Stack.Screen name="Drawer" component={DrawerNavigator} />
    </Stack.Navigator>
  </NavigationContainer>
);

export default App;

