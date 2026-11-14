import type { NavigationProp } from "@react-navigation/native";
import type { RootStackParamList } from "navigation/types";

// Any navigation object can navigate to a root screen; the action bubbles up
// to the root stack, so these helpers work from whichever stack the caller is in
export type RootNavigation = Pick<NavigationProp<RootStackParamList>, "navigate">;

// Shows the location permission step from anywhere, popping the root back to
// the onboarding stack (or opening it). Any steps left behind it are
// unreachable, because the step blocks going back.
export const showLocationStep = ( navigation: RootNavigation ) => {
  navigation.navigate(
    "OnboardingStackNavigator",
    { screen: "location_explainer" },
    { pop: true },
  );
};

// Shows the sign-up email step, popping back to it when it's already in the
// onboarding stack (Login was opened from it) instead of stacking a second copy
export const showSignUpStep = ( navigation: RootNavigation ) => {
  navigation.navigate(
    "OnboardingStackNavigator",
    { screen: "signup_email", pop: true },
    { pop: true },
  );
};
