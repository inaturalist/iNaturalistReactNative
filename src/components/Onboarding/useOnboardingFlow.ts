import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { OnboardingStepParamList } from "navigation/types";

import { useOnboardingFlowHost } from "./OnboardingFlowContext";
import type { OnboardingStepId } from "./onboardingSteps";
import { getExitSheet, getNextStepId, isOnboardingStepId } from "./onboardingSteps";

// Steps run in more than one navigator, so a step can only assume its siblings
// are routes named by step id; host.steps limits which ones it reaches
type OnboardingStepNavigation = NativeStackNavigationProp<OnboardingStepParamList>;

// What a step hands to the next one; only the sign-up email step passes anything
type NextStepParams = OnboardingStepParamList["signup_credentials"];

const useOnboardingFlow = ( ) => {
  const navigation = useNavigation<OnboardingStepNavigation>( );
  const { name } = useRoute( );
  const host = useOnboardingFlowHost( );

  if ( !isOnboardingStepId( name ) ) {
    throw new Error( `useOnboardingFlow used outside an onboarding step: ${name}` );
  }
  const stepId: OnboardingStepId = name;

  const proceedToNext = ( params?: NextStepParams ) => {
    const nextStepId = getNextStepId( host.steps, stepId );
    if ( !nextStepId ) {
      host.onFinish( );
    } else if ( nextStepId === "signup_credentials" ) {
      if ( !params ) {
        throw new Error( `${stepId} must pass the email to signup_credentials` );
      }
      navigation.navigate( nextStepId, params );
    } else {
      navigation.navigate( nextStepId );
    }
  };

  const logIn = ( ) => host.onLogIn( stepId );

  return {
    exit: host.onExit,
    exitSheet: getExitSheet( stepId ),
    logIn,
    proceedToNext,
    signedIn: host.onSignIn,
    stepId,
  };
};

export default useOnboardingFlow;
