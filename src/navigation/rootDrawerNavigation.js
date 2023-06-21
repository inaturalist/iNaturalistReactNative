// @flow

import { createDrawerNavigator } from "@react-navigation/drawer";
import CustomDrawerContent from "components/CustomDrawerContent";
import { hideHeader, showHeader } from "navigation/navigationOptions";
import type { Node } from "react";
import * as React from "react";
import { View } from "react-native";

import BottomTabNavigator from "./BottomTabNavigator";

const drawerOptions = {
  ...showHeader,
  // this removes the default hamburger menu from header
  headerLeft: ( ) => <View />,
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
      options={hideHeader}
    />
  </Drawer.Navigator>
);

export default RootDrawerNavigator;
