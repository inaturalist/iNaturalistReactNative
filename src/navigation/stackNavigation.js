// @flow

import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import DrawerNavigator from "./drawerNavigation";
import ObsDetails from "../components/ObsDetails/ObsDetails";
import UserProfile from "../components/UserProfile/UserProfile";
import ObservationProvider from "../providers/ObservationProvider";

const Stack = createNativeStackNavigator( );

const screenOptions = { headerShown: false };

const App = ( ): React.Node => (
  <NavigationContainer>
    {/*
      Why is this providing observations to the entire app and not used
      selectively for components that need to consume observations?
      ~~~kueda
    */}
    <ObservationProvider>
      <Stack.Navigator screenOptions={screenOptions}>
        <Stack.Screen name="Drawer" component={DrawerNavigator} />
        <Stack.Screen name="ObsDetails" component={ObsDetails} options={{ headerShown: true }} />
        <Stack.Screen name="UserProfile" component={UserProfile} options={{ headerShown: true }} />
      </Stack.Navigator>
    </ObservationProvider>
  </NavigationContainer>
);

export default App;

