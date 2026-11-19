import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { logFirebaseEvent } from "sharedHelpers/tracking";

import type { OnboardingStepId } from "./onboardingSteps";
import { getStepPosition } from "./onboardingSteps";

// Logs onboarding_screen_view each time the step becomes visible, including
// when the user comes back to it
const useOnboardingScreenView = ( stepId: OnboardingStepId ) => {
  useFocusEffect(
    useCallback( ( ) => {
      logFirebaseEvent( "onboarding_screen_view", {
        screen_id: stepId,
        position: getStepPosition( stepId ),
      } );
    }, [stepId] ),
  );
};

export default useOnboardingScreenView;
