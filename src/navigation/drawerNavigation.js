// @flow

import * as React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";

import ObsList from "../components/Observations/ObsList";
import Login from "../components/LoginSignUp/Login";
import SignUp from "../components/LoginSignUp/SignUp";

// this removes the default hamburger menu from header
const screenOptions = { headerLeft: () => <></> };

const Drawer = createDrawerNavigator();

const DrawerNavigator = (): React.Node => (
  <Drawer.Navigator screenOptions={screenOptions}>
    <Drawer.Screen name="my observations" component={ObsList} />
    <Drawer.Screen name="login" component={Login} />
    <Drawer.Screen name="sign up" component={SignUp} />
  </Drawer.Navigator>
);

export default DrawerNavigator;
