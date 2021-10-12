// @flow

import * as React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";

import ObservationsList from "../components/Observations/ObservationsList";

const config = { headerShown: false };
const screenOptions = { ...config };

const Drawer = createDrawerNavigator();

const DrawerNavigator = ( ): React.Node => (
  <Drawer.Navigator screenOptions={screenOptions}>
    <Drawer.Screen name="my observations" component={ObservationsList} />
  </Drawer.Navigator>
);

export default DrawerNavigator;
