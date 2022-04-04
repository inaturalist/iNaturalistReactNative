// @flow

import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createDrawerNavigator } from "@react-navigation/drawer";

import PlaceholderComponent from "../components/PlaceholderComponent";
import MyObservationsStackNavigator from "./myObservationsStackNavigation";
import ExploreStackNavigator from "./exploreStackNavigation";
import Search from "../components/Search/Search";
import Login from "../components/LoginSignUp/Login";
import ProjectsStackNavigation from "./projectsStackNavigation";
import CameraStackNavigation from "./cameraStackNavigation";
import Settings from "../components/Settings/Settings";

// this removes the default hamburger menu from header
const screenOptions = { headerLeft: ( ) => <></> };
const hideHeader = {
  headerShown: false,
  label: "my observations"
};

const Drawer = createDrawerNavigator( );

// TODO: create a custom side menu that only shows some of these stacks and screens
const App = ( ): React.Node => (
  <NavigationContainer>
    <Drawer.Navigator screenOptions={screenOptions} name="Drawer">
      <Drawer.Screen
        name="my observations"
        component={MyObservationsStackNavigator}
        options={hideHeader}
      />
      <Drawer.Screen
        name="explore stack"
        component={ExploreStackNavigator}
        options={hideHeader}
      />
      <Drawer.Screen name="missions/seen nearby" component={PlaceholderComponent} />
      <Drawer.Screen name="search" component={Search} />
      <Drawer.Screen name="identify" component={PlaceholderComponent} />
      <Drawer.Screen name="following (dashboard)" component={PlaceholderComponent} />
      <Drawer.Screen name="impact" component={PlaceholderComponent} />
      <Drawer.Screen
        name="projects"
        component={ProjectsStackNavigation}
        options={hideHeader}
      />
      <Drawer.Screen name="guides" component={PlaceholderComponent} />
      <Drawer.Screen name="about" component={PlaceholderComponent} />
      <Drawer.Screen name="help/tutorials" component={PlaceholderComponent} />
      <Drawer.Screen name="settings" component={Settings} options={hideHeader} />
      <Drawer.Screen name="login" component={Login} />
      <Drawer.Screen
        name="camera"
        component={CameraStackNavigation}
        options={hideHeader}
      />
    </Drawer.Navigator>
  </NavigationContainer>
);

export default App;

