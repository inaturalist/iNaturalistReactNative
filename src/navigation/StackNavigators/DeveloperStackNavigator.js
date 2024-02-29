import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Developer from "components/Developer/Developer";
import Log from "components/Developer/Log";
import Identify from "components/Identify/Identify";
import NetworkLogging from "components/NetworkLogging";
import UiLibrary from "components/UiLibrary";
import type { Node } from "react";
import React from "react";

const Stack = createNativeStackNavigator( );

const DeveloperStackNavigator = ( ): Node => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: "deeppink", color: "white" },
      headerTintColor: "white",
      headerTitleStyle: { color: "white" }
    }}
  >
    <Stack.Screen
      name="debug"
      label="Debug"
      component={Developer}
    />
    <Stack.Screen
      name="network"
      component={NetworkLogging}
    />
    <Stack.Screen
      name="UILibrary"
      label="UI Library"
      component={UiLibrary}
    />
    <Stack.Screen
      name="log"
      component={Log}
    />
    <Stack.Screen
      name="Identify"
      label="Identify"
      component={Identify}
    />
  </Stack.Navigator>
);

export default DeveloperStackNavigator;
