import Button from "components/SharedComponents/Buttons/Button";
import Heading1 from "components/SharedComponents/Typography/Heading1";
import React from "react";
import useTranslation from "sharedHooks/useTranslation";

import OnboardingStepLayout from "./OnboardingStepLayout";
import useOnboardingFlow from "./useOnboardingFlow";

// Stands in for each step until its ticket builds it; delete once none use it
const OnboardingPlaceholderStep = ( ) => {
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
      <Heading1>{stepId}</Heading1>
    </OnboardingStepLayout>
  );
};

export default OnboardingPlaceholderStep;
