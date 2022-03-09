// @flow

import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createDrawerNavigator } from "@react-navigation/drawer";

import PlaceholderComponent from "../components/PlaceholderComponent";
import MyObservationsStackNavigator from "./myObservationsStackNavigation";
import MessagesStackNavigator from "./messagesStackNavigation";
import ExploreStackNavigator from "./exploreStackNavigation";
import Search from "../components/Search/Search";
import Login from "../components/LoginSignUp/Login";
import ProjectsStackNavigation from "./projectsStackNavigation";
import CameraStackNavigation from "./cameraStackNavigation";
import CustomDrawerContent from "../components/CustomDrawerContent";

// this removes the default hamburger menu from header
const screenOptions = { headerLeft: ( ) => <></> };
const hideHeader = {
  headerShown: false,
  label: "my observations"
};

const Drawer = createDrawerNavigator( );

const App = ( ): React.Node => (
  <NavigationContainer>
    <Drawer.Navigator
      screenOptions={screenOptions}
      name="Drawer"
      drawerContent={( props ) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen
        name="my observations"
        component={MyObservationsStackNavigator}
        options={hideHeader}
      />
      <Drawer.Screen name="identify" component={PlaceholderComponent} />
      <Drawer.Screen name="search" component={Search} />
      <Drawer.Screen
        name="messages"
        component={MessagesStackNavigator}
        options={hideHeader}
      />
      <Drawer.Screen
        name="projects"
        component={ProjectsStackNavigation}
        options={hideHeader}
      />
      <Drawer.Screen name="settings" component={PlaceholderComponent} />
      <Drawer.Screen name="following (dashboard)" component={PlaceholderComponent} />
      <Drawer.Screen name="about" component={PlaceholderComponent} />
      <Drawer.Screen name="help/tutorials" component={PlaceholderComponent} />
      <Drawer.Screen name="login" component={Login} />
      <Drawer.Screen
        name="camera"
        component={CameraStackNavigation}
        options={hideHeader}
      />
      <Drawer.Screen
        name="explore stack"
        component={ExploreStackNavigator}
        options={hideHeader}
      />
    </Drawer.Navigator>
  </NavigationContainer>
);

export default App;

