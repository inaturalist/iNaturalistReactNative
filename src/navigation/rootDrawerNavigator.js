// @flow

import { createDrawerNavigator } from "@react-navigation/drawer";
import {
  hideDrawerHeaderLeft, hideHeader
} from "navigation/navigationOptions";
import NoBottomTabStackNavigator from "navigation/StackNavigators/NoBottomTabStackNavigator";
import type { Node } from "react";
import * as React from "react";

import BottomTabNavigator from "./BottomTabNavigator";
import CustomDrawerContent from "./CustomDrawerContent";

const drawerOptions = {
  ...hideHeader,
  ...hideDrawerHeaderLeft,
  drawerType: "front",
  drawerStyle: {
    backgroundColor: "transparent"
  }
};

const Drawer = createDrawerNavigator( );

const drawerRenderer = ( { state, navigation, descriptors } ) => (
  <CustomDrawerContent
    state={state}
    navigation={navigation}
    descriptors={descriptors}
  />
);

const RootDrawerNavigator = ( ): Node => (
  <Drawer.Navigator
    screenOptions={drawerOptions}
    name="Drawer"
    drawerContent={drawerRenderer}
  >
    <Drawer.Screen
      name="TabNavigator"
      component={BottomTabNavigator}
    />
    <Drawer.Screen
      name="NoBottomTabStackNavigator"
      component={NoBottomTabStackNavigator}
    />
  </Drawer.Navigator>
);

export default RootDrawerNavigator;
