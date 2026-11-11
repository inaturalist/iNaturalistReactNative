import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SignUpCredentialsStep from "components/LoginSignUp/SignUpCredentialsStep";
import SignUpEmailStep from "components/LoginSignUp/SignUpEmailStep";
import OnboardingCarousel from "components/Onboarding/OnboardingCarousel";
import type { OnboardingFlowHost } from "components/Onboarding/OnboardingFlowContext";
import { OnboardingFlowProvider } from "components/Onboarding/OnboardingFlowContext";
import type { OnboardingStepId } from "components/Onboarding/onboardingSteps";
import { FIRST_RUN_STEP_IDS, ONBOARDING_STEPS } from "components/Onboarding/onboardingSteps";
import CommunityIdStep from "components/Onboarding/steps/CommunityIdStep";
import ImpactStep from "components/Onboarding/steps/ImpactStep";
import LocationExplainerStep from "components/Onboarding/steps/LocationExplainerStep";
import ObsStoryStep from "components/Onboarding/steps/ObsStoryStep";
import ResearchGradeStep from "components/Onboarding/steps/ResearchGradeStep";
import WelcomeStep from "components/Onboarding/steps/WelcomeStep";
import { preventSwipeToGoBack } from "navigation/navigationOptions";
import type { OnboardingStackParamList, RootStackScreenProps } from "navigation/types";
import type { ComponentType } from "react";
import React, { useMemo } from "react";
import { useOnboardingShown } from "sharedHelpers/installData";
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

const OnboardingStackNavigator = ( { navigation }: RootStackScreenProps ) => {
  const onboardingV2Enabled = useFeatureFlag( FeatureFlag.OnboardingV2Enabled );
  const [, setOnboardingShown] = useOnboardingShown( );

  const firstRunHost = useMemo<OnboardingFlowHost>( ( ) => ( {
    steps: FIRST_RUN_STEP_IDS,
    onFinish: ( ) => {
      // Name the destination explicitly rather than relying on
      // RootStackNavigator falling back to its first registered screen once
      // onboardingShown unregisters the onboarding stack
      navigation.reset( {
        index: 0,
        routes: [{ name: "TabNavigator" }],
      } );
      setOnboardingShown( true );
    },
  } ), [navigation, setOnboardingShown] );

  return (
    <OnboardingFlowProvider value={firstRunHost}>
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
    </OnboardingFlowProvider>
  );
};

export default OnboardingStackNavigator;
