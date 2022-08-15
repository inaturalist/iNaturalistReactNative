// @flow

import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as React from "react";

import Identify from "../components/Identify/Identify";

const Stack = createNativeStackNavigator( );

const screenOptions = {
  headerShown: true
};

const IdentifyStackNavigation = ( ): React.Node => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen
      name="Identify"
      component={Identify}
    />
  </Stack.Navigator>
);

export default IdentifyStackNavigation;
