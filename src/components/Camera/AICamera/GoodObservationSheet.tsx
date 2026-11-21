import { BottomSheet } from "components/SharedComponents";
import { View } from "components/styledComponents";
import React, { useCallback } from "react";
import { useFeatureFlag } from "sharedHooks";
import { FeatureFlag } from "stores/createFeatureFlagSlice";
import useStore from "stores/useStore";

// Shown the first time the AI camera opens, while the onboarding flag is on.
// Any dismissal (close button, backdrop tap, swipe down) marks it shown.
// Content comes in a follow-up (MOB-1926)
const GoodObservationSheet = ( ) => {
  // Key in layout.shownOnce. Signing out clears that store, so the sheet can
  // show again afterwards
  const showKey = "camera-tip-good-observation";
  const onboardingV2Enabled = useFeatureFlag( FeatureFlag.OnboardingV2Enabled );
  const alreadyShown = useStore(
    state => !!state.layout.shownOnce[showKey],
  );
  const setShownOnce = useStore( state => state.layout.setShownOnce );

  const markShown = useCallback(
    ( ) => setShownOnce( showKey ),
    [setShownOnce],
  );

  if ( !onboardingV2Enabled || alreadyShown ) return null;

  return (
    <BottomSheet onPressClose={markShown} testID="GoodObservationSheet">
      <View />
    </BottomSheet>
  );
};

export default GoodObservationSheet;
