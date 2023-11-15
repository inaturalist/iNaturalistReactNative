// @flow

// eslint-disable-next-line import/no-extraneous-dependencies
import { createProfiledDrawerNavigator } from "@shopify/react-native-performance-navigation-drawer";
import {
  hideDrawerHeaderLeft, hideHeader,
  showHeader
} from "navigation/navigationOptions";
import AddObsStackNavigator from "navigation/StackNavigators/AddObsStackNavigator";
import LoginStackNavigator from "navigation/StackNavigators/LoginStackNavigator";
import type { Node } from "react";
import * as React from "react";

import BottomTabNavigator from "./BottomTabNavigator";
import CustomDrawerContent from "./CustomDrawerContent";

const drawerOptions = {
  ...showHeader,
  drawerType: "front",
  drawerStyle: {
    backgroundColor: "transparent"
  }
};

const Drawer = createProfiledDrawerNavigator( );

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
      options={{
        ...hideHeader,
        ...hideDrawerHeaderLeft
      }}
    />
    <Drawer.Screen
      name="LoginNavigator"
      component={LoginStackNavigator}
      options={{
        headerShown: false
      }}
    />
    <Drawer.Screen
      name="CameraNavigator"
      component={AddObsStackNavigator}
      options={{
        ...hideHeader,
        ...hideDrawerHeaderLeft
      }}
    />
  </Drawer.Navigator>
);

export default RootDrawerNavigator;
