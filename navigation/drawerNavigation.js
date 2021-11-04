// @flow

import * as React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";

import ObsList from "../components/Observations/ObsList";

// this removes the default hamburger menu from header
const screenOptions = { headerLeft: ( ) => <></> };

const Drawer = createDrawerNavigator();

const DrawerNavigator = ( ): React.Node => (
  <Drawer.Navigator screenOptions={screenOptions}>
    <Drawer.Screen name="my observations" component={ObsList} />
  </Drawer.Navigator>
);

export default DrawerNavigator;
