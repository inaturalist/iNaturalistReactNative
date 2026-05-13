import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AdvancedSearch
  from "components/Explore/ExploreV2/screens/AdvancedSearch";
import ExploreResults
  from "components/Explore/ExploreV2/screens/ExploreResults";
import UniversalSearch
  from "components/Explore/ExploreV2/screens/UniversalSearch";
import { hideHeader } from "navigation/navigationOptions";
import type { ExploreStackParamList } from "navigation/types";
import React from "react";

// When navigating out of this stack, useNavigation should be typed like:
// useNavigation<ExploreStackScreenProps<"ExploreResults">["navigation"]>( );
const Stack = createNativeStackNavigator<ExploreStackParamList>( );

const ExploreStackNavigator = ( ) => (
  <Stack.Navigator initialRouteName="ExploreResults">
    <Stack.Screen
      name="ExploreResults"
      component={ExploreResults}
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
