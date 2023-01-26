// @flow

import { createDrawerNavigator } from "@react-navigation/drawer";
import About from "components/About";
import CustomDrawerContent from "components/CustomDrawerContent";
import Login from "components/LoginSignUp/Login";
import NetworkLogging from "components/NetworkLogging";
import PlaceholderComponent from "components/PlaceholderComponent";
import Search from "components/Search/Search";
import Settings from "components/Settings/Settings";
import Mortal from "components/SharedComponents/Mortal";
import UiLibrary from "components/UiLibrary";
import { t } from "i18next";
import { hideHeader, showHeader } from "navigation/navigationOptions";
import type { Node } from "react";
import * as React from "react";
import { View } from "react-native";

import IdentifyStackNavigation from "./identifyStackNavigation";
import MainStackNavigation from "./mainStackNavigation";
import ProjectsStackNavigation from "./projectsStackNavigation";

const drawerOptions = {
  ...showHeader,
  // this removes the default hamburger menu from header
  headerLeft: ( ) => <View />
};

// The login component should be not preserve its state or effects after the
// user navigates away from it. This will simply cause it to unmount when it
// loses focus
const MortalLogin = ( ) => <Mortal><Login /></Mortal>;

const Drawer = createDrawerNavigator( );

const drawerRenderer = ( { state, navigation, descriptors } ) => (
  <CustomDrawerContent state={state} navigation={navigation} descriptors={descriptors} />
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
    />
  </Drawer.Navigator>
);

export default RootDrawerNavigator;
