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

// When navigating out of this stack, useNavigation should be typed like:
// useNavigation<ExploreStackScreenProps<"ExploreObservations">["navigation"]>( );
const Stack = createNativeStackNavigator<ExploreStackParamList>( );

const ExploreStackNavigator = ( ) => (
  <Stack.Navigator initialRouteName="ExploreObservations">
    <Stack.Screen
      name="ExploreObservations"
      component={ExploreObservations}
      options={hideHeader}
    />
    <Stack.Screen
      name="UniversalSearch"
      component={UniversalSearch}
      options={hideHeader}
    />
    <Stack.Screen
      name="AdvancedSearch"
      component={AdvancedSearch}
      options={hideHeader}
    />
  </Stack.Navigator>
);

export default ExploreStackNavigator;
