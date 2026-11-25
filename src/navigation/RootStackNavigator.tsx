import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginStackNavigator from "navigation/StackNavigators/LoginStackNavigator";
import NoBottomTabStackNavigator from "navigation/StackNavigators/NoBottomTabStackNavigator";
import OnboardingStackNavigator from "navigation/StackNavigators/OnboardingStackNavigator";
import type { RootStackParamList } from "navigation/types";
import { RealmContext } from "providers/contexts";
import React, { useState } from "react";
import User from "realmModels/User";
import { useOnboardingShown, useOnboardingV2Shown } from "sharedHelpers/installData";
import useFeatureFlag from "sharedHooks/useFeatureFlag";
import { FeatureFlag } from "stores/createFeatureFlagSlice";

import BottomTabNavigator from "./BottomTabNavigator";
import { hideHeader, preventSwipeToGoBack } from "./navigationOptions";

const { useRealm } = RealmContext;

const Stack = createNativeStackNavigator<RootStackParamList>( );

// DEVELOPERS: do you need to add any screens here? This is the RootStack.
// All the rest of our screens live in:
// NoBottomTabStackNavigator, TabStackNavigator, OnboardingStackNavigator, or LoginStackNavigator

const RootStackNavigator = ( ) => {
  const [onboardingShown] = useOnboardingShown( );
  const [onboardingV2Shown] = useOnboardingV2Shown( );
  const onboardingV2Enabled = useFeatureFlag( FeatureFlag.OnboardingV2Enabled );
  const realm = useRealm( );
  // Read once so logging in partway through onboarding doesn't remove the
  // steps still to come. Signing out restarts the app, so this stays accurate
  const [signedOutAtLaunch] = useState( ( ) => !User.currentUser( realm ) );

  // Signed-out installs that finished the old onboarding go through v2 once,
  // since its first step is where people agree to the terms
  const showOnboarding = !onboardingShown
    || ( onboardingV2Enabled && signedOutAtLaunch && !onboardingV2Shown );

  return (
    <Stack.Navigator screenOptions={{ ...hideHeader, ...preventSwipeToGoBack, animation: "none" }}>
      {showOnboarding && (
        <Stack.Screen
          name="OnboardingStackNavigator"
          component={OnboardingStackNavigator}
        />
      )}
      {/*
        Registered even while onboarding is shown so the carousel can exit to
        Login with TabNavigator beneath it
      */}
      <Stack.Screen
        name="TabNavigator"
        component={BottomTabNavigator}
      />

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
