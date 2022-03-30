// @flow

import * as React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import ExploreProvider from "../providers/ExploreProvider";
import Explore from "../components/Explore/Explore";
import ExploreFilters from "../components/Explore/ExploreFilters";
import ExploreLanding from "../components/Explore/ExploreLanding";

const Stack = createNativeStackNavigator( );

const hideHeader = {
  headerShown: false
};

const ExploreStackNavigation = ( ): React.Node => (
  <ExploreProvider>
    <Stack.Navigator>
      <Stack.Screen
        name="ExploreLanding"
        component={ExploreLanding}
        options={hideHeader}
      />
      <Stack.Screen
        name="Explore"
        component={Explore}
        options={hideHeader}
      />
      <Stack.Screen
        name="ExploreFilters"
        component={ExploreFilters}
        options={hideHeader}
      />
    </Stack.Navigator>
  </ExploreProvider>
);

export default ExploreStackNavigation;
