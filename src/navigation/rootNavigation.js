// @flow

import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createDrawerNavigator } from "@react-navigation/drawer";

import PlaceholderComponent from "../components/PlaceholderComponent";
import MyObservationsStackNavigator from "./myObservationsStackNavigation";
import ExploreStackNavigator from "./exploreStackNavigation";
import Search from "../components/Search/Search";
import Projects from "../components/Projects/Projects";

// this removes the default hamburger menu from header
const screenOptions = { headerLeft: ( ) => <></> };
const hideHeader = {
  headerShown: false,
  label: "my observations"
};

const Drawer = createDrawerNavigator( );

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
      <Drawer.Screen name="projects" component={Projects} />
      <Drawer.Screen name="guides" component={PlaceholderComponent} />
      <Drawer.Screen name="about" component={PlaceholderComponent} />
      <Drawer.Screen name="help/tutorials" component={PlaceholderComponent} />
      <Drawer.Screen name="settings" component={PlaceholderComponent} />
      <Drawer.Screen name="logout" component={PlaceholderComponent} />
    </Drawer.Navigator>
  </NavigationContainer>
);

export default App;

