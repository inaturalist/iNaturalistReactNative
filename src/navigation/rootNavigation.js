// @flow

import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createDrawerNavigator } from "@react-navigation/drawer";

import PlaceholderComponent from "../components/PlaceholderComponent";
import ObservationProvider from "../providers/ObservationProvider";
import MyObservationsStackNavigator from "./myObservationsStackNavigation";

// this removes the default hamburger menu from header
const screenOptions = { headerLeft: ( ) => <></> };
const hideHeader = {
  headerShown: false,
  label: "my observations"
};

const Drawer = createDrawerNavigator( );

const App = ( ): React.Node => (
  <NavigationContainer>
    <ObservationProvider>
      <Drawer.Navigator screenOptions={screenOptions} name="Drawer">
        <Drawer.Screen
          name="my observations"
          component={MyObservationsStackNavigator}
          options={hideHeader}
        />
        <Drawer.Screen name="missions/seen nearby" component={PlaceholderComponent} />
        <Drawer.Screen name="search" component={PlaceholderComponent} />
        <Drawer.Screen name="identify" component={PlaceholderComponent} />
        <Drawer.Screen name="following (dashboard)" component={PlaceholderComponent} />
        <Drawer.Screen name="impact" component={PlaceholderComponent} />
        <Drawer.Screen name="projects" component={PlaceholderComponent} />
        <Drawer.Screen name="guides" component={PlaceholderComponent} />
        <Drawer.Screen name="about" component={PlaceholderComponent} />
        <Drawer.Screen name="help/tutorials" component={PlaceholderComponent} />
        <Drawer.Screen name="settings" component={PlaceholderComponent} />
        <Drawer.Screen name="logout" component={PlaceholderComponent} />
      </Drawer.Navigator>
    </ObservationProvider>
  </NavigationContainer>
);

export default App;

