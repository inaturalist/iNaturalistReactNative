import OnboardingChecklistItem from "components/Onboarding/OnboardingChecklistItem";
import OnboardingStepLayout from "components/Onboarding/OnboardingStepLayout";
import { BOLD_SPANS, UNDERLINED_SPANS } from "components/Onboarding/onboardingTransSpans";
import useOnboardingFlow from "components/Onboarding/useOnboardingFlow";
import Button from "components/SharedComponents/Buttons/Button";
import Body2 from "components/SharedComponents/Typography/Body2";
import Heading1 from "components/SharedComponents/Typography/Heading1";
import { View } from "components/styledComponents";
import React from "react";
import { Trans } from "react-i18next";
import useTranslation from "sharedHooks/useTranslation";

const ResearchGradeStep = ( ) => {
  const { t } = useTranslation( );
  const { stepId, proceedToNext } = useOnboardingFlow( );

  return (
    <OnboardingStepLayout
      footer={(
        <>
          <Body2 className="px-[6px] mb-[24px]">
            <Trans
              i18nKey="Research-Grade-observations-can-more-easily-be-used-to"
              components={BOLD_SPANS}
            />
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
          i18nKey="Together-we-help-observations-reach-Research-Grade"
          components={UNDERLINED_SPANS}
        />
      </Heading1>
      <Body2 className="mt-[19px] mb-3">
        {t( "Your-observation-can-become-Research-Grade-when" )}
      </Body2>
      <View className="gap-3 px-[10px]">
        <OnboardingChecklistItem>
          <Trans i18nKey="the-community-vets-the-identification" components={BOLD_SPANS} />
        </OnboardingChecklistItem>
        <OnboardingChecklistItem>
          <Trans i18nKey="it-has-a-photo-or-sound-date-and-location" components={BOLD_SPANS} />
        </OnboardingChecklistItem>
        <OnboardingChecklistItem>
          <Trans
            i18nKey="it-passes-iNaturalists-standards-for-good-data"
            components={BOLD_SPANS}
          />
        </OnboardingChecklistItem>
      </View>
    </OnboardingStepLayout>
  );
};

export default ResearchGradeStep;
