import { useCallback } from "react";
import useFeatureFlag from "sharedHooks/useFeatureFlag";
import { FeatureFlag } from "stores/createFeatureFlagSlice";
import useStore from "stores/useStore";

// Keys in layout.shownOnce. Signing out clears that store, so the tips can
// show again afterwards
export enum CAMERA_TIP {
  GOOD_OBSERVATION_SHEET = "camera-tip-good-observation",
  UPLOAD_COACHMARK = "camera-tip-upload",
  MULTI_CAPTURE = "camera-tip-multi-capture"
}

// A camera tip shown until the user has dealt with it once; never shown
// while the onboarding flag is off
const useOneTimeTip = ( key: CAMERA_TIP ) => {
  const onboardingEnabled = useFeatureFlag( FeatureFlag.OnboardingV2Enabled );
  // Keys are only ever set to true, so being present means shown
  const alreadyShown = useStore( state => key in state.layout.shownOnce );
  const setShownOnce = useStore( state => state.layout.setShownOnce );

  const markShown = useCallback( ( ) => setShownOnce( key ), [key, setShownOnce] );

  return {
    alreadyShown,
    markShown,
    shouldShow: onboardingEnabled && !alreadyShown,
  };
};

// The upload coachmark follows the good-observation sheet, so it waits until
// that sheet has been dismissed
export const useUploadCoachmark = ( ) => {
  const { alreadyShown: sheetShown } = useOneTimeTip( CAMERA_TIP.GOOD_OBSERVATION_SHEET );
  const { markShown, shouldShow } = useOneTimeTip( CAMERA_TIP.UPLOAD_COACHMARK );

  return { markShown, shouldShow: sheetShown && shouldShow };
};

export default useOneTimeTip;
