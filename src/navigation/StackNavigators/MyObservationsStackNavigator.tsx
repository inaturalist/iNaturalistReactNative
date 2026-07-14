import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MyObservationsResults from "components/MyObservations/MyObservationsResults";
import SearchMyObservationsTaxon
  from "components/MyObservations/Search/SearchMyObservationsTaxon";
import { hideHeader } from "navigation/navigationOptions";
import type { MyObservationsStackParamList } from "navigation/types";
import React from "react";

export const SCREEN_NAME_MY_OBSERVATIONS_RESULTS = "MyObservationsResults";
export const SCREEN_NAME_SEARCH_MY_OBSERVATIONS = "SearchMyObservations";

// When navigating out of this stack, useNavigation should be typed like:
// useNavigation<MyObservationsStackScreenProps<"MyObservationsResults">["navigation"]>( );
const Stack = createNativeStackNavigator<MyObservationsStackParamList>( );

const MyObservationsStackNavigator = ( ) => (
  <Stack.Navigator initialRouteName={SCREEN_NAME_MY_OBSERVATIONS_RESULTS}>
    <Stack.Screen
      name={SCREEN_NAME_MY_OBSERVATIONS_RESULTS}
      component={MyObservationsResults}
      options={hideHeader}
    />
    <Stack.Screen
      name={SCREEN_NAME_SEARCH_MY_OBSERVATIONS}
      component={SearchMyObservationsTaxon}
      options={hideHeader}
    />
  </Stack.Navigator>
);

export default MyObservationsStackNavigator;
