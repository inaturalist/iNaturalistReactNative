import OnboardingStepLayout from "components/Onboarding/OnboardingStepLayout";
import { BOLD_SPANS, UNDERLINED_SPANS } from "components/Onboarding/onboardingTransSpans";
import useOnboardingFlow from "components/Onboarding/useOnboardingFlow";
import useOnboardingScreenView from "components/Onboarding/useOnboardingScreenView";
import Button from "components/SharedComponents/Buttons/Button";
import Body2 from "components/SharedComponents/Typography/Body2";
import Heading1 from "components/SharedComponents/Typography/Heading1";
import React from "react";
import { Trans } from "react-i18next";
import useTranslation from "sharedHooks/useTranslation";

const ImpactStep = ( ) => {
  const { t } = useTranslation( );
  const { stepId, proceedToNext } = useOnboardingFlow( );
  useOnboardingScreenView( stepId );

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
        <Trans i18nKey="Your-observations-make-a-difference" components={UNDERLINED_SPANS} />
      </Heading1>
      <Body2 className="mt-[19px]">
        <Trans
          i18nKey="More-than-8000-scientific-studies-have-relied-on-iNaturalist"
          components={BOLD_SPANS}
        />
      </Body2>
    </OnboardingStepLayout>
  );
};

export default ImpactStep;
