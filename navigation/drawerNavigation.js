// @flow

import * as React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";

import ObservationsList from "../components/Observations/ObservationsList";

// this removes the default hamburger menu from header
const screenOptions = { headerLeft: ( ) => <></> };

const Drawer = createDrawerNavigator();

const DrawerNavigator = ( ): React.Node => (
  <Drawer.Navigator screenOptions={screenOptions}>
    <Drawer.Screen name="my observations" component={ObservationsList} />
  </Drawer.Navigator>
);

export default DrawerNavigator;
