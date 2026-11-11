import { useCallback } from "react";
import { useOnboardingShown } from "sharedHelpers/installData";
import useFeatureFlag from "sharedHooks/useFeatureFlag";
import { FeatureFlag } from "stores/createFeatureFlagSlice";

import type { RootNavigation } from "./onboardingNavigation";
import { showLocationStep } from "./onboardingNavigation";

// Where the user lands after logging in or creating an account: the location
// permission step while onboarding is unfinished, otherwise wherever the
// caller would normally go
const useAfterSignIn = ( ) => {
  const onboardingV2Enabled = useFeatureFlag( FeatureFlag.OnboardingV2Enabled );
  const [onboardingShown] = useOnboardingShown( );

  return useCallback( (
    navigation: RootNavigation,
    otherwise: ( ) => void,
  ) => {
    if ( onboardingV2Enabled && !onboardingShown ) {
      showLocationStep( navigation );
      return;
    }
    otherwise( );
  }, [onboardingV2Enabled, onboardingShown] );
};

export default useAfterSignIn;
