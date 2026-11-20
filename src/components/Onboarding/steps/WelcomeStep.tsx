import OnboardingStepLayout from "components/Onboarding/OnboardingStepLayout";
import useOnboardingFlow from "components/Onboarding/useOnboardingFlow";
import Button from "components/SharedComponents/Buttons/Button";
import Heading1 from "components/SharedComponents/Typography/Heading1";
import UnderlinedLink from "components/SharedComponents/Typography/UnderlinedLink";
import { View } from "components/styledComponents";
import React from "react";
import useTranslation from "sharedHooks/useTranslation";

// Placeholder layout to exercise the flow until the design lands
const WelcomeStep = ( ) => {
  const { t } = useTranslation( );
  const {
    stepId, proceedToNext, logIn, learnMore,
  } = useOnboardingFlow( );
  return (
    <OnboardingStepLayout
      footer={(
        <View className="gap-3">
          <UnderlinedLink
            className="self-center"
            onPress={learnMore}
            testID={`Onboarding.${stepId}.learnMore`}
          >
            {t( "Learn-More" )}
          </UnderlinedLink>
          <Button
            level="focus"
            text={t( "CONTINUE" )}
            onPress={proceedToNext}
            testID={`Onboarding.${stepId}.next`}
          />
          <Button
            level="neutral"
            text={t( "LOG-IN" )}
            onPress={logIn}
            testID={`Onboarding.${stepId}.logIn`}
          />
        </View>
      )}
    >
      <Heading1>{stepId}</Heading1>
    </OnboardingStepLayout>
  );
};

export default WelcomeStep;
