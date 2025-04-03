// @flow

import { createDrawerNavigator } from "@react-navigation/drawer";
import {
  hideDrawerHeaderLeft, hideHeader
} from "navigation/navigationOptions";
import LoginStackNavigator from "navigation/StackNavigators/LoginStackNavigator";
import NoBottomTabStackNavigator from "navigation/StackNavigators/NoBottomTabStackNavigator";
import OnboardingStackNavigator from "navigation/StackNavigators/OnboardingStackNavigator";
import type { Node } from "react";
import * as React from "react";
import { useOnboardingShown } from "sharedHelpers/installData.ts";

import BottomTabNavigator from "./BottomTabNavigator";
import CustomDrawerContent from "./CustomDrawerContent";

const drawerOptions = {
  ...hideHeader,
  ...hideDrawerHeaderLeft,
  drawerType: "front",
  drawerStyle: {
    backgroundColor: "transparent"
  },
  swipeEnabled: false
};

const Drawer = createDrawerNavigator( );

const drawerRenderer = ( { state, navigation, descriptors } ) => (
  <CustomDrawerContent
    state={state}
    navigation={navigation}
    descriptors={descriptors}
  />
);

// DEVELOPERS: do you need to add any screens here? All the rest of our screens live in
// NoBottomTabStackNavigator, TabStackNavigator, OnboardingStackNavigator, or LoginStackNavigator

const RootDrawerNavigator = ( ): Node => {
  const [onboardingShown] = useOnboardingShown( );

  return (
    <Drawer.Navigator
      screenOptions={drawerOptions}
      name="Drawer"
      drawerContent={drawerRenderer}
    >
      {!onboardingShown
        ? (
          <Drawer.Screen
            name="OnboardingStackNavigator"
            component={OnboardingStackNavigator}
          />
        )
        : (
          <Drawer.Screen
            name="TabNavigator"
            component={BottomTabNavigator}
          />

        )}
      <Drawer.Screen
        name="NoBottomTabStackNavigator"
        component={NoBottomTabStackNavigator}
      />
      <Drawer.Screen
        name="LoginStackNavigator"
        component={LoginStackNavigator}
      />
    </Drawer.Navigator>
  );
};

export default RootDrawerNavigator;
