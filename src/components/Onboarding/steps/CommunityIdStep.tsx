import OnboardingStepLayout from "components/Onboarding/OnboardingStepLayout";
import { UNDERLINED_SPANS } from "components/Onboarding/onboardingTransSpans";
import useOnboardingFlow from "components/Onboarding/useOnboardingFlow";
import Button from "components/SharedComponents/Buttons/Button";
import Body2 from "components/SharedComponents/Typography/Body2";
import Heading1 from "components/SharedComponents/Typography/Heading1";
import React from "react";
import { Trans } from "react-i18next";
import useTranslation from "sharedHooks/useTranslation";

const CommunityIdStep = ( ) => {
  const { t } = useTranslation( );
  const { stepId, proceedToNext } = useOnboardingFlow( );

  return (
    <OnboardingStepLayout
      footer={(
        <Button
          level="focus"
          text={t( "CONTINUE" )}
          onPress={proceedToNext}
          testID={`Onboarding.${stepId}.next`}
        />
      )}
    >
      <Heading1 accessibilityRole="header">
        <Trans
          i18nKey="Real-people-will-identify-your-observation"
          components={UNDERLINED_SPANS}
        />
      </Heading1>
      <Body2 className="mt-[19px]">
        {t( "Our-global-community-works-together-to-help-identify-the-species-youre-looking-at" )}
      </Body2>
    </OnboardingStepLayout>
  );
};

export default CommunityIdStep;
