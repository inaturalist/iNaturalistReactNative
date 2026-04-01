import { createNativeStackNavigator } from "@react-navigation/native-stack";
import OnboardingCarousel from "components/Onboarding/OnboardingCarousel";
import type { OnboardingStackParamList } from "navigation/types";
import React from "react";

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

const OnboardingStackNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="Onboarding"
      component={OnboardingCarousel}
      options={{
        headerShown: false,
        presentation: "modal",
        contentStyle: { backgroundColor: "transparent" },
      }}
    />
  </Stack.Navigator>
);

export default OnboardingStackNavigator;
