import {
  Body1,
  Body2,
  BottomSheetV2,
  Button,
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import React, { useCallback } from "react";
import { useFeatureFlag, useTranslation } from "sharedHooks";
import { FeatureFlag } from "stores/createFeatureFlagSlice";
import useStore from "stores/useStore";

// Shown the first time the AI camera opens, while the onboarding flag is on.
// CONTINUE and any other dismissal (close button and backdrop tap via
// onPressClose, swipe down via onDismiss) mark it shown
const GoodObservationSheet = ( ) => {
  const { t } = useTranslation( );
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
    <BottomSheetV2
      headerText={t( "HOW-TO-MAKE-A-GOOD-OBSERVATION" )}
      onPressClose={markShown}
      onDismiss={markShown}
    >
      <View className="px-5 pb-5 gap-y-6" testID="GoodObservationSheet">
        <View className="gap-y-4">
          <View className="gap-y-1">
            <Body1>{t( "Clear-photo-of-a-single-living-thing" )}</Body1>
            <Body2>
              {t( "common-species-are-great-just-make-sure-the-shot-is-as-sharp-as-possible" )}
            </Body2>
          </View>
          <View className="gap-y-1">
            <Body1>{t( "Wild-animals-and-plants" )}</Body1>
            <Body2>
              {t( "not-pets-garden-plants-or-zoo-animals-only-things-living-freely" )}
            </Body2>
          </View>
          <View className="gap-y-1">
            <Body1>{t( "Evidence-is-ok" )}</Body1>
            <Body2>
              {t( "scat-tracks-and-eggs-all-count-as-do-fallen-leaves-fruits" )}
            </Body2>
          </View>
        </View>
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
