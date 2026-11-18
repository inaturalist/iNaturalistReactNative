import { tailwindFontBold } from "appConstants/fontFamilies";
import OnboardingChecklistItem from "components/Onboarding/OnboardingChecklistItem";
import OnboardingStepLayout from "components/Onboarding/OnboardingStepLayout";
import useOnboardingFlow from "components/Onboarding/useOnboardingFlow";
import Button from "components/SharedComponents/Buttons/Button";
import Body2 from "components/SharedComponents/Typography/Body2";
import Heading1 from "components/SharedComponents/Typography/Heading1";
import { Text, View } from "components/styledComponents";
import React from "react";
import { Trans } from "react-i18next";
import useTranslation from "sharedHooks/useTranslation";

// For strings whose <1> spans are bold
const BOLD_SPANS = [
  <Text key="0" />,
  <Text key="1" className={tailwindFontBold} />,
];

const ObsStoryStep = ( ) => {
  const { t } = useTranslation( );
  const { stepId, proceedToNext } = useOnboardingFlow( );

  return (
    <OnboardingStepLayout
      footer={(
        <>
          <Body2 className="px-[6px] mb-[24px]">
            {t( "Even-a-photo-of-something-commonly-seen-in-your-area-can-help-science" )}
          </Body2>
          <Button
            level="focus"
            text={t( "CONTINUE" )}
            onPress={proceedToNext}
            testID={`Onboarding.${stepId}.next`}
          />
        </>
      )}
    >
      <Heading1 accessibilityRole="header">
        <Trans
          i18nKey="Every-observation-tells-a-story"
          components={[
            <Text key="0" />,
            <Text key="1" className="underline" />,
          ]}
        />
      </Heading1>
      <Body2 className="my-3">{t( "An-observation-is" )}</Body2>
      <View className="gap-3 px-[10px]">
        <OnboardingChecklistItem>
          <Trans i18nKey="a-photo-or-sound-recording" components={BOLD_SPANS} />
        </OnboardingChecklistItem>
        <OnboardingChecklistItem>
          <Trans i18nKey="of-one-living-thing" components={BOLD_SPANS} />
        </OnboardingChecklistItem>
        <OnboardingChecklistItem>
          <Trans i18nKey="at-the-time-and-place-you-saw-it" components={BOLD_SPANS} />
        </OnboardingChecklistItem>
      </View>
    </OnboardingStepLayout>
  );
};

export default ObsStoryStep;
