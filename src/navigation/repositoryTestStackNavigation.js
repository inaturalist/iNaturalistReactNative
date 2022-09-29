import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as React from "react";

import RepositoryTestDetail from "../components/RepositoryTest/Detail";
import RepositoryTestObservations from "../components/RepositoryTest/Observations";

const Stack = createNativeStackNavigator( );

const screenOptions = {
  headerShown: true
};

const RepositoryTestStackNavigation = ( ): React.Node => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen
      name="RepositoryTestObservations"
      component={RepositoryTestObservations}
    />
    <Stack.Screen
      name="RepositoryTestDetail"
      component={RepositoryTestDetail}
    />
  </Stack.Navigator>
);

export default RepositoryTestStackNavigation;
