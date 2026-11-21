import {
  Body1,
  Body2,
  BottomSheet,
  Button,
  Heading2,
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import React, { useCallback } from "react";
import { useFeatureFlag, useTranslation } from "sharedHooks";
import { FeatureFlag } from "stores/createFeatureFlagSlice";
import useStore from "stores/useStore";

// Shown the first time the AI camera opens, while the onboarding flag is on.
// CONTINUE and any other dismissal (close button, backdrop tap, swipe down)
// mark it shown
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
    <BottomSheet onPressClose={markShown} testID="GoodObservationSheet">
      <View className="px-[30px] pb-5">
        <Heading2 className="mb-5" accessibilityRole="header">
          {t( "How-to-make-a-good-observation" )}
        </Heading2>
        <Body1 className="mb-1">{t( "Clear-photo-of-a-single-living-thing" )}</Body1>
        <Body2 className="mb-4">
          {t( "common-species-are-great-just-make-sure-the-shot-is-as-sharp-as-possible" )}
        </Body2>
        <Body1 className="mb-1">{t( "Wild-animals-and-plants" )}</Body1>
        <Body2 className="mb-4">
          {t( "not-pets-garden-plants-or-zoo-animals-only-things-living-freely" )}
        </Body2>
        <Body1 className="mb-1">{t( "Evidence-is-ok" )}</Body1>
        <Body2 className="mb-6">
          {t( "scat-tracks-and-eggs-all-count-as-do-fallen-leaves-fruits" )}
        </Body2>
        <Button
          level="focus"
          text={t( "CONTINUE" )}
          onPress={markShown}
          testID="GoodObservationSheet.continue"
        />
      </View>
    </BottomSheet>
  );
};

export default GoodObservationSheet;
