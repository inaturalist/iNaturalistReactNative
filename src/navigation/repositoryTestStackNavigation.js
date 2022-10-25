import { createNativeStackNavigator } from "@react-navigation/native-stack";
import RepositoryTestDetail from "components/RepositoryTest/Detail";
import RepositoryTestObservations from "components/RepositoryTest/Observations";
import * as React from "react";

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
