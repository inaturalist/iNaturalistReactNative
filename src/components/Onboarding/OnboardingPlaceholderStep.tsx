import Button from "components/SharedComponents/Buttons/Button";
import Heading1 from "components/SharedComponents/Typography/Heading1";
import { View } from "components/styledComponents";
import React from "react";
import useTranslation from "sharedHooks/useTranslation";

import OnboardingStepLayout from "./OnboardingStepLayout";
import type { OnboardingStepId } from "./onboardingSteps";
import useOnboardingFlow from "./useOnboardingFlow";

// Steps whose finished design offers a Log in button
const STEPS_WITH_LOG_IN: readonly OnboardingStepId[] = ["welcome", "signup_email"];

// Stands in for each step until its ticket builds it; delete once none use it
const OnboardingPlaceholderStep = ( ) => {
  const { t } = useTranslation( );
  const { stepId, proceedToNext, logIn } = useOnboardingFlow( );

  return (
    <OnboardingStepLayout
      footer={(
        <View className="gap-3">
          <Button
            level="focus"
            text={t( "CONTINUE" )}
            onPress={proceedToNext}
            testID={`Onboarding.${stepId}.next`}
          />
          {STEPS_WITH_LOG_IN.includes( stepId ) && (
            <Button
              level="neutral"
              text={t( "LOG-IN" )}
              onPress={logIn}
              testID={`Onboarding.${stepId}.logIn`}
            />
          )}
        </View>
      )}
    >
      <Heading1>{stepId}</Heading1>
    </OnboardingStepLayout>
  );
};

export default OnboardingPlaceholderStep;
