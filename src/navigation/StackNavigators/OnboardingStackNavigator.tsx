import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SignUpCredentialsStep from "components/LoginSignUp/SignUpCredentialsStep";
import SignUpEmailStep from "components/LoginSignUp/SignUpEmailStep";
import OnboardingCarousel from "components/Onboarding/OnboardingCarousel";
import type { OnboardingStepId } from "components/Onboarding/onboardingSteps";
import { ONBOARDING_STEPS } from "components/Onboarding/onboardingSteps";
import CommunityIdStep from "components/Onboarding/steps/CommunityIdStep";
import ImpactStep from "components/Onboarding/steps/ImpactStep";
import LocationExplainerStep from "components/Onboarding/steps/LocationExplainerStep";
import ObsStoryStep from "components/Onboarding/steps/ObsStoryStep";
import ResearchGradeStep from "components/Onboarding/steps/ResearchGradeStep";
import WelcomeStep from "components/Onboarding/steps/WelcomeStep";
import { preventSwipeToGoBack } from "navigation/navigationOptions";
import type { OnboardingStackParamList } from "navigation/types";
import type { ComponentType } from "react";
import React from "react";
import useFeatureFlag from "sharedHooks/useFeatureFlag";
import { FeatureFlag } from "stores/createFeatureFlagSlice";

const Stack = createNativeStackNavigator<OnboardingStackParamList>( );

const STEP_COMPONENTS: Record<OnboardingStepId, ComponentType> = {
  welcome: WelcomeStep,
  obs_story: ObsStoryStep,
  community_id: CommunityIdStep,
  research_grade: ResearchGradeStep,
  impact: ImpactStep,
  signup_email: SignUpEmailStep,
  signup_credentials: SignUpCredentialsStep,
  location_explainer: LocationExplainerStep,
};

const OnboardingStackNavigator = ( ) => {
  const onboardingV2Enabled = useFeatureFlag( FeatureFlag.OnboardingV2Enabled );

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {onboardingV2Enabled
        ? ONBOARDING_STEPS.map( ( { id } ) => (
          <Stack.Screen
            key={id}
            name={id}
            component={STEP_COMPONENTS[id]}
            options={id === "location_explainer"
              ? preventSwipeToGoBack
              : undefined}
          />
        ) )
        : (
          <Stack.Screen
            name="Onboarding"
            component={OnboardingCarousel}
          />
        )}
    </Stack.Navigator>
  );
};

export default OnboardingStackNavigator;
