import GoodObservationTips from "components/Camera/GoodObservationTips";
import {
  BottomSheetV2,
  Button,
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import React, { useCallback } from "react";
import { useFeatureFlag, useTranslation } from "sharedHooks";
import { FeatureFlag } from "stores/createFeatureFlagSlice";
import useStore from "stores/useStore";

// Key in layout.shownOnce. Signing out clears that store, so the sheet can
// show again afterwards. Exported because the upload coachmark waits for it
export const GOOD_OBSERVATION_SHEET_KEY = "camera-tip-good-observation";

// Shown the first time the AI camera opens, while the onboarding flag is on.
// CONTINUE and any other dismissal (close button and backdrop tap via
// onPressClose, swipe down via onDismiss) mark it shown
const GoodObservationSheet = ( ) => {
  const { t } = useTranslation( );
  const onboardingV2Enabled = useFeatureFlag( FeatureFlag.OnboardingV2Enabled );
  const alreadyShown = useStore(
    state => !!state.layout.shownOnce[GOOD_OBSERVATION_SHEET_KEY],
  );
  const setShownOnce = useStore( state => state.layout.setShownOnce );

  const markShown = useCallback(
    ( ) => setShownOnce( GOOD_OBSERVATION_SHEET_KEY ),
    [setShownOnce],
  );

  if ( !onboardingV2Enabled || alreadyShown ) return null;

  return (
    <BottomSheetV2
      contentClassName="pt-0"
      headerText={t( "HOW-TO-MAKE-A-GOOD-OBSERVATION" )}
      onPressClose={markShown}
      onDismiss={markShown}
    >
      <View className="p-5 gap-y-6" testID="GoodObservationSheet">
        <GoodObservationTips />
        <Button
          level="focus"
          text={t( "CONTINUE" )}
          onPress={markShown}
          testID="GoodObservationSheet.continue"
        />
      </View>
    </BottomSheetV2>
  );
};

export default GoodObservationSheet;
