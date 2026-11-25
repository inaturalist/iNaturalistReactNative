import { GOOD_OBSERVATION_SHEET_KEY } from "components/Camera/AICamera/GoodObservationSheet";
import { useCallback } from "react";
import { useFeatureFlag } from "sharedHooks";
import { FeatureFlag } from "stores/createFeatureFlagSlice";
import useStore from "stores/useStore";

// Key in layout.shownOnce. Signing out clears that store, so the coachmark
// can show again afterwards
const UPLOAD_COACHMARK_KEY = "camera-tip-upload";

// The upload coachmark follows the good-observation sheet: it shows once that
// sheet has been dismissed, while the onboarding flag is on.
const useUploadCoachmark = ( ) => {
  const onboardingV2Enabled = useFeatureFlag( FeatureFlag.OnboardingV2Enabled );
  const sheetShown = useStore(
    state => !!state.layout.shownOnce[GOOD_OBSERVATION_SHEET_KEY],
  );
  const coachmarkShown = useStore(
    state => !!state.layout.shownOnce[UPLOAD_COACHMARK_KEY],
  );
  const setShownOnce = useStore( state => state.layout.setShownOnce );

  const isVisible = onboardingV2Enabled
    && sheetShown
    && !coachmarkShown;

  const dismiss = useCallback( ( ) => {
    if ( isVisible ) setShownOnce( UPLOAD_COACHMARK_KEY );
  }, [isVisible, setShownOnce] );

  return { isVisible, dismiss };
};

export default useUploadCoachmark;
