import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginStackNavigator from "navigation/StackNavigators/LoginStackNavigator";
import NoBottomTabStackNavigator from "navigation/StackNavigators/NoBottomTabStackNavigator";
import OnboardingStackNavigator from "navigation/StackNavigators/OnboardingStackNavigator";
import * as React from "react";
import { useOnboardingShown } from "sharedHelpers/installData";

import BottomTabNavigator from "./BottomTabNavigator";
import { hideHeader, preventSwipeToGoBack } from "./navigationOptions";

const Stack = createNativeStackNavigator( );

// DEVELOPERS: do you need to add any screens here? This is the RootStack.
// All the rest of our screens live in:
// NoBottomTabStackNavigator, TabStackNavigator, OnboardingStackNavigator, or LoginStackNavigator

const RootStackNavigator = ( ) => {
  const [onboardingShown] = useOnboardingShown( );

  return (
    <Stack.Navigator screenOptions={{ ...hideHeader, ...preventSwipeToGoBack, animation: "none" }}>
      {!onboardingShown
        ? (
          <Stack.Screen
            name="OnboardingStackNavigator"
            component={OnboardingStackNavigator}
          />
        )
        : (
          <Stack.Screen
            name="TabNavigator"
            component={BottomTabNavigator}
          />

        )}
      <Stack.Screen
        name="NoBottomTabStackNavigator"
        component={NoBottomTabStackNavigator}
      />
      <Stack.Screen
        name="LoginStackNavigator"
        component={LoginStackNavigator}
      />
    </Stack.Navigator>
  );
};

export default RootStackNavigator;
