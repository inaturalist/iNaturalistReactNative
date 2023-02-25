// @flow

import { createDrawerNavigator } from "@react-navigation/drawer";
import CustomDrawerContent from "components/CustomDrawerContent";
<<<<<<< HEAD
import Login from "components/LoginSignUp/Login";
import NetworkLogging from "components/NetworkLogging";
import PlaceholderComponent from "components/PlaceholderComponent";
import Search from "components/Search/Search";
import Settings from "components/Settings/Settings";
import Mortal from "components/SharedComponents/Mortal";
import UiLibrary from "components/UiLibrary";
import { t } from "i18next";
import { hideHeader, showCustomHeader, showHeader } from "navigation/navigationOptions";
=======
import { hideHeader, showHeader } from "navigation/navigationOptions";
>>>>>>> b3268903 (Wire up routes)
import type { Node } from "react";
import * as React from "react";
import { View } from "react-native";

import MainStackNavigation from "./mainStackNavigation";

const drawerOptions = {
  ...showHeader,
  // this removes the default hamburger menu from header
  headerLeft: ( ) => <View />
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
      name="MainStack"
      component={MainStackNavigation}
      options={hideHeader}
    />
<<<<<<< HEAD
    <Drawer.Screen
      name="search"
      component={Search}
      options={{ headerTitle: t( "Search" ) }}
    />
    <Drawer.Screen
      name="identify"
      component={IdentifyStackNavigation}
      options={hideHeader}
    />
    <Drawer.Screen
      name="projects"
      component={ProjectsStackNavigation}
      options={hideHeader}
    />
    <Drawer.Screen
      name="settings"
      component={Settings}
      options={{ headerTitle: t( "Settings" ) }}
    />
    <Drawer.Screen
      name="about"
      component={About}
      options={{ headerTitle: t( "About-iNaturalist" ) }}
    />
    <Drawer.Screen name="help" component={PlaceholderComponent} />
    <Drawer.Screen name="login" component={MortalLogin} options={hideHeader} />
    <Drawer.Screen
      name="network"
      component={NetworkLogging}
    />
    <Drawer.Screen
      name="UI Library"
      component={UiLibrary}
      options={showCustomHeader}
    />
=======
>>>>>>> b3268903 (Wire up routes)
  </Drawer.Navigator>
);

export default RootDrawerNavigator;
