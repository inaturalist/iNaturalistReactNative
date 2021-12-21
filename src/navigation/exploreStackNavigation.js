// @flow

import * as React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HeaderBackButton } from "@react-navigation/elements";

import ExploreProvider from "../providers/ExploreProvider";
import Explore from "../components/Explore/Explore";
import ExploreFilters from "../components/Explore/ExploreFilters";
import FiltersIcon from "../components/Explore/FiltersIcon";
import ClearFiltersButton from "../components/Explore/ClearFilterButton";

const Stack = createNativeStackNavigator( );

const screenOptions = {
  headerShown: true
};

const ExploreStackNavigation = ( ): React.Node => (
  <ExploreProvider>
    <Stack.Navigator screenOptions={screenOptions}>
        {/* TODO: Figure out where Explore actually needs to live in navigator.
        It seems like it should be a tab navigator within the drawer navigator,
        which has stacks nested inside for Explore, ObsList, and Notifications
        and another tab navigator for Camera */}
        <Stack.Screen
          name="Explore"
          component={Explore}
          options={( { navigation } ) => ( {
            headerLeft: ( ) => <HeaderBackButton onPress={( ) => navigation.goBack( )} />,
            headerRight: ( ) => <FiltersIcon />
          } )}
        />
        <Stack.Screen
          name="ExploreFilters"
          component={ExploreFilters}
          options={( { navigation } ) => ( {
            headerLeft: ( ) => <HeaderBackButton onPress={( ) => navigation.goBack( )} />,
            headerRight: ( ) => <ClearFiltersButton />
          } )}
        />
    </Stack.Navigator>
  </ExploreProvider>
);

export default ExploreStackNavigation;
