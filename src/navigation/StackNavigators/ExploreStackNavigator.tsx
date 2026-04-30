import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AdvancedSearch
  from "components/Explore/ExploreV2/screens/AdvancedSearch";
import ExploreObservations
  from "components/Explore/ExploreV2/screens/ExploreObservations";
import UniversalSearch
  from "components/Explore/ExploreV2/screens/UniversalSearch";
import { hideHeader } from "navigation/navigationOptions";
import type { ExploreStackParamList } from "navigation/types";
import React from "react";
import colors from "styles/tailwindColors";

const BASE_SCREEN_OPTIONS = {
  headerBackButtonDisplayMode: "minimal",
  headerTintColor: colors.darkGray,
} as const;

const Stack = createNativeStackNavigator<ExploreStackParamList>( );

const ExploreStackNavigator = ( ) => (
  <Stack.Navigator
    initialRouteName="ExploreObservations"
    screenOptions={BASE_SCREEN_OPTIONS}
  >
    <Stack.Group screenOptions={hideHeader}>
      <Stack.Screen
        name="ExploreObservations"
        component={ExploreObservations}
      />
      <Stack.Screen
        name="UniversalSearch"
        component={UniversalSearch}
      />
      <Stack.Screen
        name="AdvancedSearch"
        component={AdvancedSearch}
      />
    </Stack.Group>
  </Stack.Navigator>
);

export default ExploreStackNavigator;
