import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { useOnboardingFlowHost } from "./OnboardingFlowContext";
import type { OnboardingStepId } from "./onboardingSteps";
import { getExitSheet, getNextStepId, isOnboardingStepId } from "./onboardingSteps";

// Steps run in more than one navigator, so a step can only assume its siblings
// are routes named by step id; host.steps limits which ones it reaches
type OnboardingStepNavigation = NativeStackNavigationProp<{
  [StepId in OnboardingStepId]: undefined;
}>;

const useOnboardingFlow = ( ) => {
  const navigation = useNavigation<OnboardingStepNavigation>( );
  const { name } = useRoute( );
  const host = useOnboardingFlowHost( );

  if ( !isOnboardingStepId( name ) ) {
    throw new Error( `useOnboardingFlow used outside an onboarding step: ${name}` );
  }
  const stepId: OnboardingStepId = name;

  const proceedToNext = ( ) => {
    const nextStepId = getNextStepId( host.steps, stepId );
    if ( nextStepId ) {
      navigation.navigate( nextStepId );
    } else {
      host.onFinish( );
    }
  };

  return {
    exit: host.onExit,
    exitSheet: getExitSheet( stepId ),
    proceedToNext,
    stepId,
  };
};

export default useOnboardingFlow;
