// @flow

import * as React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";

import ObsList from "../components/Observations/ObsList";
import PlaceholderComponent from "../components/PlaceholderComponent";

// this removes the default hamburger menu from header
const screenOptions = { headerLeft: ( ) => <></> };

const Drawer = createDrawerNavigator();

const DrawerNavigator = ( ): React.Node => (
  <Drawer.Navigator screenOptions={screenOptions}>
    <Drawer.Screen name="my observations" component={ObsList} />
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
);

export default DrawerNavigator;
